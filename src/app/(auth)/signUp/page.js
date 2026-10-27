
"use client";

import "./signup.css";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { registerUser } from "@/lib/sessions";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [role, setRole] = useState("renter");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const result = registerUser({
        name,
        email,
        password,
        role,
      });

      if (!result.success) {
        setError(result.message || "Could not create your account.");
        return;
      }

     
      if (role === "owner") {
        router.push("/owner/dashboard");
      } else {
        router.push("/cars");
      }
    // } catch {
    //   setError("Could not create your account. Please try again.");
    // }

    } catch (err) {
  console.error("Signup error:", err);
  setError(
    err instanceof Error
      ? err.message
      : "Could not create your account. Please try again."
  );
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
            autoComplete="name"
            required
          />

          <label htmlFor="role">Register as</label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="renter">Renter — I want to rent cars</option>
            <option value="owner">Owner — I want to list my cars</option>
          </select>

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={8}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
          />

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            minLength={8}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            required
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <label htmlFor="terms">
          <input
            type="checkbox"
            id="terms"
            name="terms"
            required
          />{" "}
          I agree to{" "}
          <Link href="/terms">Terms and Conditions</Link>
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
