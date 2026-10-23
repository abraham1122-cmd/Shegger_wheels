


"use client";

import "./signup.css";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { registerUser } from "@/lib/sessions";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const result = registerUser({ name, email, password });

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.push("/cars");
    } catch {
      setError("Could not create your account. Please try again.");
    }
  }

  return (
    <div className="form-section">
      <h1>Create Account</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={8}
            placeholder="At least 8 characters"
            required
          />

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            minLength={8}
            placeholder="Re-enter your password"
            required
          />
        </div>

        {error && <p role="alert">{error}</p>}



         
         <label htmlFor="terms" className="">

                <input
                type="checkbox"
                id="terms"
                required
                />
                I agree to{""}
                <a href="#" className="">
                    Terms and Conditions
                </a>
            </label>
         

        <button type="submit">Sign Up</button>
      </form>

      <p>
        Already have an account? <Link href="/signin">Sign In</Link>
      </p>
      <Link href="/">Back to Home</Link>
    </div>
  );
}






