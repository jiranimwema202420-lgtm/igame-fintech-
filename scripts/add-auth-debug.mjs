import fs from "node:fs";

// 1. Add debug logging to Sign Up page
let signupContent = fs.readFileSync("src/app/signup/page.tsx", "utf8");

signupContent = signupContent.replace(
  "async function handleSubmit(event: React.FormEvent) {",
  `async function handleSubmit(event: React.FormEvent) {
    console.log("[SignUp Debug] Form submitted");`,
);

signupContent = signupContent.replace(
  "const supabase = createClient();",
  `console.log("[SignUp Debug] Creating Supabase client...");
      const supabase = createClient();
      console.log("[SignUp Debug] Supabase client created");`,
);

signupContent = signupContent.replace(
  "if (signUpError) throw signUpError;",
  `console.log("[SignUp Debug] Supabase response:", { data, signUpError });
      if (signUpError) throw signUpError;`,
);

fs.writeFileSync("src/app/signup/page.tsx", signupContent, "utf8");
console.log("Added debug logging to Sign Up page.");

// 2. Add debug logging to Forgot Password page
let forgotContent = fs.readFileSync("src/app/forgot-password/page.tsx", "utf8");

forgotContent = forgotContent.replace(
  "async function handleSubmit(event: React.FormEvent) {",
  `async function handleSubmit(event: React.FormEvent) {
    console.log("[ForgotPassword Debug] Form submitted");`,
);

forgotContent = forgotContent.replace(
  "const supabase = createClient();",
  `console.log("[ForgotPassword Debug] Creating Supabase client...");
      const supabase = createClient();
      console.log("[ForgotPassword Debug] Supabase client created");`,
);

forgotContent = forgotContent.replace(
  "if (resetError) throw resetError;",
  `console.log("[ForgotPassword Debug] Supabase response:", { resetError });
      if (resetError) throw resetError;`,
);

fs.writeFileSync("src/app/forgot-password/page.tsx", forgotContent, "utf8");
console.log("Added debug logging to Forgot Password page.");
