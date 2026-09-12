import fs from "node:fs";

const filePath = "src/middleware.ts";
let content = fs.readFileSync(filePath, "utf8");

// Add all auth routes and the test route to publicPaths
content = content.replace(
  'const publicPaths = ["/login"];',
  'const publicPaths = ["/login", "/signup", "/forgot-password", "/update-password", "/auth/callback", "/test", "/"];',
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Middleware updated with public paths.");
