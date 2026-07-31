"use client";

export default function GlobalError({ reset }) {
  return (
    <html>
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "sans-serif",
          background: "#0a0a0f",
          color: "#fff",
        }}
      >
        <h1>Something went critically wrong</h1>
        <p>Please refresh the page.</p>
        <button
          onClick={() => reset()}
          style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", background: "#6d5ef5", color: "#fff", border: "none", cursor: "pointer" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}