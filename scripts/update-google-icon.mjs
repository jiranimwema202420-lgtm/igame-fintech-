import fs from "node:fs";
import path from "node:path";

const loginPagePath = path.join("src", "app", "login", "page.tsx");

let content = fs.readFileSync(loginPagePath, "utf8");

// 1. Update import
content = content.replace(
  'import { Chrome } from "lucide-react";',
  'import { Globe } from "lucide-react";',
);

// 2. Update JSX component
content = content.replace(
  '<Chrome className="h-5 w-5" />',
  '<Globe className="mr-2 h-5 w-5" />',
);

fs.writeFileSync(loginPagePath, content, "utf8");

console.log("Updated Login Page icon to Globe.");
