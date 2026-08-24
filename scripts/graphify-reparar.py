"""Reconstruye el grafo de graphify materializando los extremos que faltan.

Problema
--------
El extractor AST de graphify emite aristas `imports_from` hacia módulos externos
(`ref_react`, `ref_next_image`, `ref_node_fs_promises`, ...) y hacia archivos
locales que no generan nodos propios (`globals.css` no se parsea, `productos.json`
es dato puro), pero no crea el nodo de destino. El chequeo de salud las marca
entonces como aristas con extremo colgante.

Solución
--------
Crear esos nodos en vez de descartar las aristas. El grafo gana precisión: pasa a
poder responder qué archivos importan React o quién lee `productos.json`.

Dos trampas que este script evita
---------------------------------
1. **Sellado del manifiesto.** Sellar todo el corpus marca como extraídos también
   los documentos cuya extracción semántica falló o nunca ocurrió. A partir de
   ahí `detect_incremental` los da por hechos y no vuelven a encolarse nunca:
   pérdida de datos silenciosa. Solo se sella lo que produjo salida real.
2. **Etiquetas de comunidad.** Los ids de comunidad de Louvain no son estables
   entre corridas, así que reutilizarlos por número reasigna cada nombre a un
   grupo distinto. Los nombres se anclan a nodos concretos en
   `graphify-out/etiquetas.json` y se recolocan por solapamiento.

Windows
-------
`graphify.extract.extract()` usa ProcessPoolExecutor con `spawn`, que reimporta
el módulo en cada worker. De ahí el guard `if __name__ == "__main__":`.

Uso:  python scripts/graphify-reparar.py
      Después edita los nombres en graphify-out/etiquetas.json y vuelve a lanzarlo.
"""

import json
from pathlib import Path

from graphify.analyze import god_nodes, suggest_questions, surprising_connections
from graphify.build import build_from_json
from graphify.cache import check_semantic_cache
from graphify.cli import _stamped_manifest_files
from graphify.cluster import cluster, score_all
from graphify.detect import detect, save_manifest
from graphify.diagnostics import diagnose_extraction, format_diagnostic_report
from graphify.export import to_json
from graphify.extract import collect_files, extract
from graphify.report import generate

RAIZ = Path(__file__).resolve().parent.parent
ROOT = RAIZ.as_posix()
SPEC = (
    Path.home() / ".claude/skills/graphify/references/extraction-spec.md"
).as_posix()

ETIQUETAS_JSON = RAIZ / "graphify-out/etiquetas.json"
LABELS_JSON = RAIZ / "graphify-out/.graphify_labels.json"

# Cuántos nodos de cada comunidad se guardan como ancla del nombre.
ANCLAS_POR_COMUNIDAD = 8
# Fracción de anclas que debe reaparecer junta para heredar el nombre.
UMBRAL_SOLAPAMIENTO = 0.5

# Etiquetas legibles para las dependencias externas más habituales.
ETIQUETAS_EXTERNAS = {
    "ref_react": "react",
    "ref_next": "next",
    "ref_next_image": "next/image",
    "ref_next_og": "next/og",
    "ref_next_font_google": "next/font/google",
    "ref_next_font_local": "next/font/local",
    "ref_node_fs_promises": "node:fs/promises",
    "ref_node_url": "node:url",
    "ref_node_path": "node:path",
    "ref_eslint_config": "eslint/config",
    "ref_eslint_config_next_core_web_vitals": "eslint-config-next/core-web-vitals",
    "ref_eslint_config_next_typescript": "eslint-config-next/typescript",
    # Imports de Python de este mismo script: el extractor no los prefija con
    # `ref_`, así que hay que declararlos para no confundirlos con documentos
    # que se quedaron fuera de la extracción.
    "json": "json (stdlib)",
    "pathlib": "pathlib (stdlib)",
    "graphify_analyze": "graphify.analyze",
    "graphify_build": "graphify.build",
    "graphify_cache": "graphify.cache",
    "graphify_cli": "graphify.cli",
    "graphify_cluster": "graphify.cluster",
    "graphify_detect": "graphify.detect",
    "graphify_diagnostics": "graphify.diagnostics",
    "graphify_export": "graphify.export",
    "graphify_extract": "graphify.extract",
    "graphify_report": "graphify.report",
}

# Archivos locales reales que el AST no convierte en nodo.
ARCHIVOS_LOCALES = {
    "src_app_globals": ("src/app/globals.css", "Tokens de diseño y animaciones"),
    "src_data_productos": ("src/data/productos.json", "Catálogo de productos (datos)"),
}


def materializar_extremos(extraccion: dict) -> tuple[int, list[str]]:
    """Crea un nodo por cada extremo referenciado que no exista.

    Devuelve cuántos se crearon y cuáles son sospechosos: un extremo que no es
    `ref_*` ni un archivo local conocido casi siempre significa que el documento
    que lo definía se quedó fuera de la extracción semántica.
    """
    ids = {n["id"] for n in extraccion["nodes"]}
    faltantes: set[str] = set()

    for arista in extraccion["edges"]:
        for extremo in (arista["source"], arista["target"]):
            if extremo not in ids:
                faltantes.add(extremo)

    sospechosos = []
    for nid in sorted(faltantes):
        if nid in ARCHIVOS_LOCALES:
            ruta, etiqueta = ARCHIVOS_LOCALES[nid]
            extraccion["nodes"].append(
                {
                    "id": nid,
                    "label": etiqueta,
                    "file_type": "code",
                    "source_file": ruta,
                    "source_location": None,
                }
            )
        else:
            if not nid.startswith("ref_") and nid not in ETIQUETAS_EXTERNAS:
                sospechosos.append(nid)
            extraccion["nodes"].append(
                {
                    "id": nid,
                    "label": ETIQUETAS_EXTERNAS.get(nid, nid.removeprefix("ref_")),
                    "file_type": "code",
                    "source_file": "(dependencia externa)",
                    "source_location": None,
                }
            )

    return len(faltantes), sospechosos


def cargar_anclas() -> list[dict]:
    """Lee los nombres de comunidad con sus nodos ancla."""
    if not ETIQUETAS_JSON.exists():
        return []
    datos = json.loads(ETIQUETAS_JSON.read_text(encoding="utf-8"))
    return datos.get("etiquetas", [])


def emparejar_etiquetas(comunidades: dict, guardadas: list[dict]) -> dict[int, str]:
    """Recoloca cada nombre guardado sobre la comunidad que conserva sus anclas.

    Los ids de Louvain cambian entre corridas, así que emparejar por número
    reasigna los nombres a grupos arbitrarios. Se empareja por solapamiento:
    para cada par (nombre, comunidad) se mide qué fracción de las anclas del
    nombre cayó dentro de la comunidad, y se asignan de mayor a menor.
    """
    miembros = {cid: set(nodos) for cid, nodos in comunidades.items()}

    puntuaciones = []
    for idx, etiqueta in enumerate(guardadas):
        anclas = set(etiqueta.get("anclas", []))
        if not anclas:
            continue
        for cid, nodos in miembros.items():
            solape = len(anclas & nodos) / len(anclas)
            if solape >= UMBRAL_SOLAPAMIENTO:
                puntuaciones.append((solape, idx, cid))

    puntuaciones.sort(reverse=True)
    nombres: dict[int, str] = {}
    usados: set[int] = set()
    for _solape, idx, cid in puntuaciones:
        if cid in nombres or idx in usados:
            continue
        nombres[cid] = guardadas[idx]["nombre"]
        usados.add(idx)

    sin_nombre = [cid for cid in comunidades if cid not in nombres]
    for cid in sin_nombre:
        nombres[cid] = f"Comunidad {cid}"
    return nombres


def guardar_anclas(G, comunidades: dict, nombres: dict[int, str]) -> None:
    """Reescribe etiquetas.json con las anclas de la agrupación actual."""
    salida = []
    for cid in sorted(comunidades, key=lambda c: -len(comunidades[c])):
        nodos = comunidades[cid]
        anclas = sorted(nodos, key=lambda nid: -G.degree(nid))[:ANCLAS_POR_COMUNIDAD]
        salida.append(
            {
                "nombre": nombres[cid],
                "nodos": len(nodos),
                "anclas": anclas,
            }
        )

    ETIQUETAS_JSON.write_text(
        json.dumps(
            {
                "_ayuda": (
                    "Edita solo el campo 'nombre'. Las anclas identifican la "
                    "comunidad entre reconstrucciones; los ids numéricos de "
                    "Louvain no son estables y por eso no se usan."
                ),
                "etiquetas": salida,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    # Espejo plano que consume `graphify export html`.
    LABELS_JSON.write_text(
        json.dumps({str(cid): nombres[cid] for cid in comunidades}, ensure_ascii=False),
        encoding="utf-8",
    )


def main() -> None:
    det = detect(RAIZ)
    # Los SVG de public/images son marcadores generados por un script que ya
    # está en el corpus; la imagen en sí no aporta información nueva.
    det["files"]["image"] = [
        f for f in det["files"].get("image", []) if "public\\images" not in f and "public/images" not in f
    ]
    det["total_files"] = sum(len(v) for v in det["files"].values())

    archivos_codigo = []
    for f in det["files"]["code"]:
        p = Path(f)
        archivos_codigo.extend(collect_files(p) if p.is_dir() else [p])
    ast = extract(archivos_codigo, cache_root=RAIZ)

    archivos_sem = [
        f for c in ("document", "paper", "image") for f in det["files"].get(c, [])
    ]
    nodos_sem, aristas_sem, hiper_sem, sin_cachear = check_semantic_cache(
        archivos_sem, root=ROOT, prompt_file=SPEC
    )
    if sin_cachear:
        print(
            f"AVISO: {len(sin_cachear)} archivos sin caché semántica. "
            "Su contenido NO entra en el grafo; vuelve a lanzar /graphify para extraerlos."
        )
        for f in sin_cachear:
            print(f"   sin extraer: {f}")

    vistos = {n["id"] for n in ast["nodes"]}
    nodos = list(ast["nodes"])
    for n in nodos_sem:
        if n["id"] not in vistos:
            nodos.append(n)
            vistos.add(n["id"])

    semantico = {"nodes": nodos_sem, "edges": aristas_sem, "hyperedges": hiper_sem}
    extraccion = {
        "nodes": nodos,
        "edges": ast["edges"] + aristas_sem,
        "hyperedges": hiper_sem,
        "input_tokens": 0,
        "output_tokens": 0,
    }

    creados, sospechosos = materializar_extremos(extraccion)
    print(f"Nodos materializados para extremos que faltaban: {creados}")
    if sospechosos:
        print(
            f"AVISO: {len(sospechosos)} extremos materializados no son dependencias "
            "externas. Suelen ser referencias a documentos que se quedaron fuera "
            "de la extracción semántica:"
        )
        for nid in sospechosos:
            print(f"   fantasma: {nid}")

    G = build_from_json(extraccion, root=ROOT, directed=False)
    if G.number_of_nodes() == 0:
        raise SystemExit("ERROR: grafo vacío")

    comunidades = cluster(G)
    cohesion = score_all(G, comunidades)
    gods = god_nodes(G)
    sorpresas = surprising_connections(G, comunidades)

    etiquetas = emparejar_etiquetas(comunidades, cargar_anclas())
    guardar_anclas(G, comunidades, etiquetas)
    sin_nombre = sum(1 for v in etiquetas.values() if v.startswith("Comunidad "))
    if sin_nombre:
        print(
            f"AVISO: {sin_nombre} comunidades sin nombre. Ponles uno en "
            f"{ETIQUETAS_JSON.relative_to(RAIZ).as_posix()} y vuelve a lanzar el script."
        )

    preguntas = suggest_questions(G, comunidades, etiquetas)

    salida = RAIZ / "graphify-out/graph.json"
    if not to_json(G, comunidades, str(salida), force=True):
        raise SystemExit("ERROR: no se pudo escribir graph.json")

    tokens = {"input": 0, "output": 0}
    informe = generate(
        G, comunidades, cohesion, etiquetas, gods, sorpresas, det, tokens, ROOT,
        suggested_questions=preguntas,
    )
    (RAIZ / "graphify-out/GRAPH_REPORT.md").write_text(informe, encoding="utf-8")

    resumen = diagnose_extraction(extraccion, directed=False, root=ROOT)
    print(format_diagnostic_report(resumen))

    colgantes = resumen.get("dangling_endpoint_edges", 0)
    ausentes = resumen.get("missing_endpoint_edges", 0)
    print(
        f"\nGrafo: {G.number_of_nodes()} nodos, {G.number_of_edges()} aristas, "
        f"{len(comunidades)} comunidades"
    )
    print(
        "Salud: OK (sin extremos colgantes ni ausentes)."
        if colgantes == 0 and ausentes == 0
        else f"AVISO: {colgantes} colgantes, {ausentes} ausentes"
    )

    # Sellar SOLO lo que produjo salida. Un documento cuya extracción semántica
    # falló debe quedar sin sellar para que detect_incremental vuelva a
    # encolarlo; sellarlo lo daría por hecho y su contenido se perdería para
    # siempre.
    corpus = det.get("all_files") or det["files"]
    sellados = _stamped_manifest_files(corpus, semantico, RAIZ)
    tipos_sem = ("document", "paper", "image")
    procesados = {f for t, fl in corpus.items() if t in tipos_sem for f in fl}
    con_sello = {f for fl in sellados.values() for f in fl}
    save_manifest(
        sellados,
        root=ROOT,
        scan_corpus={f for fl in corpus.values() for f in fl},
        clear_semantic=(procesados - con_sello) or None,
    )
    print(f"Manifiesto: {len(con_sello)} archivos sellados, {len(procesados - con_sello)} pendientes de extraer")


if __name__ == "__main__":
    main()
