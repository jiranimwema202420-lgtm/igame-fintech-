import fs from "node:fs";
import path from "node:path";

// Create a brand new route at /test
const dir = path.join("src", "app", "test");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(
  path.join(dir, "page.tsx"),
  `"use client";

export default function TestPage() {
  return (
    <div style={{ padding: "50px", textAlign: "center", backgroundColor: "#000", color: "#fff", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "30px", marginBottom: "20px" }}>Isolation Test</h1>
      <p style={{ marginBottom: "20px", color: "#aaa" }}>No Supabase. No Tailwind. Just pure React.</p>
      
      <button 
        onClick={() => alert("SUCCESS: JavaScript is working perfectly on Vercel!")}
        style={{ 
          padding: "20px 40px", 
          fontSize: "20px", 
          cursor: "pointer",
          backgroundColor: "#fff",
          color: "#000",
          border: "none",
          borderRadius: "10px",
          fontWeight: "bold"
        }}
      >
        CLICK ME TO TEST
      </button>
    </div>
  );
}
`,
);

console.log("Isolation test page created at /test");
