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

Windows
-------
`graphify.extract.extract()` usa ProcessPoolExecutor con `spawn`, que reimporta
el módulo en cada worker. De ahí el guard `if __name__ == "__main__":`.

Uso:  python scripts/graphify-reparar.py
"""

import json
from pathlib import Path

from graphify.analyze import god_nodes, suggest_questions, surprising_connections
from graphify.build import build_from_json
from graphify.cache import check_semantic_cache
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
}

# Archivos locales reales que el AST no convierte en nodo.
ARCHIVOS_LOCALES = {
    "src_app_globals": ("src/app/globals.css", "Tokens de diseño y animaciones"),
    "src_data_productos": ("src/data/productos.json", "Catálogo de productos (datos)"),
}


def materializar_extremos(extraccion: dict) -> int:
    """Crea un nodo por cada extremo referenciado que no exista. Devuelve cuántos."""
    ids = {n["id"] for n in extraccion["nodes"]}
    faltantes: set[str] = set()

    for arista in extraccion["edges"]:
        for extremo in (arista["source"], arista["target"]):
            if extremo not in ids:
                faltantes.add(extremo)

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
            extraccion["nodes"].append(
                {
                    "id": nid,
                    "label": ETIQUETAS_EXTERNAS.get(nid, nid.removeprefix("ref_")),
                    "file_type": "code",
                    "source_file": "(dependencia externa)",
                    "source_location": None,
                }
            )

    return len(faltantes)


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
            "Vuelve a lanzar /graphify para extraerlos."
        )

    vistos = {n["id"] for n in ast["nodes"]}
    nodos = list(ast["nodes"])
    for n in nodos_sem:
        if n["id"] not in vistos:
            nodos.append(n)
            vistos.add(n["id"])

    extraccion = {
        "nodes": nodos,
        "edges": ast["edges"] + aristas_sem,
        "hyperedges": hiper_sem,
        "input_tokens": 0,
        "output_tokens": 0,
    }

    creados = materializar_extremos(extraccion)
    print(f"Nodos materializados para extremos que faltaban: {creados}")

    G = build_from_json(extraccion, root=ROOT, directed=False)
    if G.number_of_nodes() == 0:
        raise SystemExit("ERROR: grafo vacío")

    comunidades = cluster(G)
    cohesion = score_all(G, comunidades)
    gods = god_nodes(G)
    sorpresas = surprising_connections(G, comunidades)

    etiquetas_path = RAIZ / "graphify-out/.graphify_labels.json"
    etiquetas = (
        {int(k): v for k, v in json.loads(etiquetas_path.read_text(encoding="utf-8")).items()}
        if etiquetas_path.exists()
        else {}
    )
    etiquetas = {cid: etiquetas.get(cid, f"Comunidad {cid}") for cid in comunidades}
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

    corpus = det.get("all_files") or det["files"]
    save_manifest(
        {k: v for k, v in corpus.items()},
        root=ROOT,
        scan_corpus={f for fl in corpus.values() for f in fl},
    )


if __name__ == "__main__":
    main()
