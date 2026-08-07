import { ImageResponse } from "next/og";

export const alt = "AutopartesRG, catálogo de autopartes";
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
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              background: "#ffb159",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2c1700",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            RG
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>AutopartesRG</div>
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
