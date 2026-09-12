import fs from "node:fs";

const filePath = "src/app/auth/callback/route.ts";
let content = fs.readFileSync(filePath, "utf8");

// Add [] to make it an array type
content = content.replace(
  "setAll(cookiesToSet: { name: string; value: string; options: CookieOptionsWithName }) {",
  "setAll(cookiesToSet: { name: string; value: string; options: CookieOptionsWithName }[]) {",
);

fs.writeFileSync(filePath, content, "utf8");
console.log("✅ Fixed setAll array type.");
