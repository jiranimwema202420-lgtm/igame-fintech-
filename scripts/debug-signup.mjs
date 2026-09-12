import fs from "node:fs";

const filePath = "src/app/signup/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

// 1. Strip ALL HTML5 validation attributes that might silently block the form
content = content.replace(/ required/g, "");
content = content.replace(/ minLength=\{6\}/g, "");

// 2. Inject a native browser alert() at the very top of the submit handler
content = content.replace(
  "event.preventDefault();",
  'event.preventDefault();\n    alert("DEBUG: Form submitted! Email: " + email);',
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Debug mode activated for Sign Up page.");
