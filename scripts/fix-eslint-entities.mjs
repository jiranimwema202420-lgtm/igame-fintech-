import fs from "node:fs";
import path from "node:path";

function replaceInFile(filePath, search, replace) {
  const fullPath = path.join(filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, "utf8");
    content = content.replace(search, replace);
    fs.writeFileSync(fullPath, content, "utf8");
    console.log("Fixed: " + filePath);
  }
}

// Fix "Don't" in Login Page
replaceInFile(
  "src/app/login/page.tsx",
  "Don't have an account?",
  "Do not have an account?",
);

// Fix "we'll" in Forgot Password Page
replaceInFile(
  "src/app/forgot-password/page.tsx",
  "Enter your email and we'll send you a reset link.",
  "Enter your email and we will send you a reset link.",
);

console.log("ESLint entity errors fixed.");
