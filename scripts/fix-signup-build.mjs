import fs from "node:fs";

const filePath = "src/app/signup/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

// Revert: Change the button back to a proper form submit button
// and fix the handler to not require FormEvent
content = content.replace(
  '<button type="button" onClick={handleSubmit} disabled={loading}',
  '<button type="submit" disabled={loading}',
);

// Revert: Change div back to form
content = content.replace(
  '<div className="space-y-4">',
  '<form onSubmit={handleSubmit} className="space-y-4">',
);
content = content.replace(
  "</div>\n\n        {error",
  "</form>\n\n        {error",
);

// Fix the handler signature to accept any event
content = content.replace(
  "async function handleSubmit(event: FormEvent<HTMLFormElement>) {",
  "async function handleSubmit(event: React.FormEvent) {",
);

// Restore event.preventDefault()
content = content.replace(
  "// event.preventDefault() removed",
  "event.preventDefault();",
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Fixed signup page build error.");
