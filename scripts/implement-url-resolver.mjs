import fs from "node:fs";

// 1. Create the getURL utility
const utilsDir = "src/lib/utils";
if (!fs.existsSync(utilsDir)) {
  fs.mkdirSync(utilsDir, { recursive: true });
}

fs.writeFileSync(
  `${utilsDir}/get-url.ts`,
  `export const getURL = (): string => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Custom production domain
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel
    "http://localhost:3000/";

  // Ensure http:// or https:// is present (Vercel omits protocol)
  url = url.includes("http") ? url : \`https://\${url}\`;
  
  // Ensure a trailing slash is included
  url = url.endsWith("/") ? url : \`\${url}/\`;
  
  return url;
};
`,
);

// 2. Update Forgot Password Page
const forgotPath = "src/app/forgot-password/page.tsx";
let forgotContent = fs.readFileSync(forgotPath, "utf8");
if (!forgotContent.includes("getURL")) {
  forgotContent =
    `import { getURL } from "@/lib/utils/get-url";\n` + forgotContent;
  forgotContent = forgotContent.replace(
    "redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,",
    "redirectTo: `${getURL()}auth/callback?next=/update-password`,",
  );
  fs.writeFileSync(forgotPath, forgotContent, "utf8");
  console.log("Updated Forgot Password page.");
}

// 3. Update Sign Up Page
const signupPath = "src/app/signup/page.tsx";
let signupContent = fs.readFileSync(signupPath, "utf8");
if (!signupContent.includes("getURL")) {
  signupContent =
    `import { getURL } from "@/lib/utils/get-url";\n` + signupContent;
  signupContent = signupContent.replace(
    "emailRedirectTo: `${window.location.origin}/auth/callback`,",
    "emailRedirectTo: `${getURL()}auth/callback`,",
  );
  fs.writeFileSync(signupPath, signupContent, "utf8");
  console.log("Updated Sign Up page.");
}

console.log("✅ URL resolver implemented successfully.");
