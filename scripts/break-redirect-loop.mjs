import fs from "node:fs";

const filePath = "src/app/(dashboard)/player/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

// Replace the silent redirect with a visible error screen
content = content.replace(
  `const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");`,
  `const { data: { user }, error } = await supabase.auth.getUser();
  
  if (!user) {
    return (
      <div style={{padding: "50px", color: "white", backgroundColor: "black", minHeight: "100vh", fontFamily: "monospace"}}>
        <h1 style={{color: "red", fontSize: "24px"}}>🛑 INFINITE LOOP BROKEN</h1>
        <p style={{fontSize: "18px", marginTop: "20px"}}>The Server Component thinks you are NOT logged in (user is null).</p>
        <p>But the Middleware thought you WERE logged in, causing the redirect loop.</p>
        <h3 style={{marginTop: "30px", color: "#aaa"}}>Supabase Error Details:</h3>
        <pre style={{color: "yellow", fontSize: "16px", whiteSpace: "pre-wrap"}}>{error?.message || "No error object returned. The session cookie is likely missing or corrupted."}</pre>
      </div>
    );
  }`,
);

fs.writeFileSync(filePath, content, "utf8");
console.log(
  "Loop breaker applied. The page will no longer redirect infinitely.",
);
