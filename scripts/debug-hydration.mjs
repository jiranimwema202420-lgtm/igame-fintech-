import fs from "node:fs";

const filePath = "src/app/signup/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

// 1. Ensure useEffect is imported
if (!content.includes("useEffect")) {
  content = content.replace(
    'import { useState, type FormEvent } from "react";',
    'import { useState, useEffect, type FormEvent } from "react";',
  );
}

// 2. Add hydration state tracker
content = content.replace(
  "export default function SignUpPage() {",
  `export default function SignUpPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => { setIsHydrated(true); }, []);
`,
);

// 3. Add visual indicator to the JSX
content = content.replace(
  '<h1 className="text-2xl font-semibold">Create Account</h1>',
  `<h1 className="text-2xl font-semibold">Create Account</h1>
          <p className={\`mt-1 text-xs font-bold \${isHydrated ? "text-green-400" : "text-red-500"}\`}>
            React Status: {isHydrated ? "HYDRATED (Interactive)" : "SERVER ONLY (Broken)"}
          </p>`,
);

// 4. Change <form> to <div> to bypass any native form quirks
content = content.replace(
  '<form onSubmit={handleSubmit} className="space-y-4">',
  '<div className="space-y-4">',
);
content = content.replace("</form>", "</div>");

// 5. Change button to standard onClick
content = content.replace(
  /<button\s+type="submit"\s+disabled=\{loading\}/,
  '<button type="button" onClick={handleSubmit} disabled={loading}',
);

// 6. Clean up the handler
content = content.replace(
  "event.preventDefault();",
  "// event.preventDefault() removed",
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Hydration visual test applied.");
