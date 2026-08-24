import { ImageResponse } from "next/og";

export const alt = "Autopartes ERG, catálogo de autopartes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen de Open Graph generada en build con next/og, sin assets externos. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #004aad 0%, #00204f 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Marca. El monograma toma el color terracota del logotipo. */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              background: "#763f2f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            ERG
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
              Autopartes ERG
            </div>
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.7)" }}>
              Tienda de repuestos multimarcas
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.06, letterSpacing: -2 }}>
            Encuentra la pieza exacta
          </div>
          <div style={{ marginTop: 26, fontSize: 30, color: "rgba(255,255,255,0.82)" }}>
            Catálogo por número OEM, marca, modelo y año. Cotiza por WhatsApp.
          </div>
        </div>
      </div>
    ),
    size
  );
}
