import fs from "node:fs";

const filePath = "src/lib/actions/wallet-actions.ts";

let content = fs.readFileSync(filePath, "utf8");

// Fix 1: Replace the invalid_type_error object literal (handles line breaks automatically)
content = content.replace(
  '{ invalid_type_error: "Amount must be a number" }',
  '{ message: "Amount must be a number" }',
);

// Fix 2: Ensure .errors is replaced with .issues (Zod v4 syntax)
content = content.replace(/\.errors\[/g, ".issues[");

fs.writeFileSync(filePath, content, "utf8");
console.log("Fixed Zod v4 schema definition and error access.");
