
"use client";

import "./signin.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createInitialAccounts, loginUser } from "@/lib/sessions";

export default function SigninPage() {
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    
      createInitialAccounts();
      
    const result = loginUser(email, password);

    if (!result.success) {
      alert(result.message || "Incorrect email or password.");
      return;
    }

  
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");

    let destination;

    if (result.role === "owner") {
      destination = "/owner";
    } else if (result.role === "admin") {
      destination = "/admin";
    } else {
      destination = "/cars";
    }

    if (next && next.startsWith("/") && !next.startsWith("//")) {
      destination = next;
    }

    router.push(destination);
    router.refresh();
  }

  return (
    <div className="form-section">
      <h1>Sign In</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit">Sign In</button>
      </form>

      {/* <p>
        Forgot your password?{" "}
        <Link href="/forgot-password">Reset it</Link>
      </p> */}

      <p>
        Don't have an account?{" "}
        <Link href="/signup">Sign Up</Link>
      </p>

      <Link href="/">Back to Home</Link>
    </div>
  );
}
