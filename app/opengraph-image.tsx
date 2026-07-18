import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "کارنکس - دستیار هوشمند کارآفرینی";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #4c1d95 50%, #7c3aed 100%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: 64,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            marginBottom: 24,
          }}
        >
          کارنکس
        </div>
        <div
          style={{
            fontSize: 36,
            opacity: 0.9,
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          دستیار هوشمند کارآفرینی — از ایده تا کسب‌وکار
        </div>
      </div>
    ),
    { ...size }
  );
}
