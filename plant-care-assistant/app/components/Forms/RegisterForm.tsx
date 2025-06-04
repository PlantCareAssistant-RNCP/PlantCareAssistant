"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/logo";
import { useAuth } from "../../../providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setIsLoading(true);
      await signUp(form.email, form.password, form.username);
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to register. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8 space-y-6">
      <Logo size={200} />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-sm"
        method="POST"
      >
        <h2 className="text-white text-lg mb-2">Registration form</h2>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="username" className="text-white font-semibold">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            className="p-3 rounded-lg bg-gray-200 text-black"
            placeholder="JaneDoe123"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-white font-semibold">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="p-3 rounded-lg bg-gray-200 text-black"
            placeholder="janeDoe123@example.com"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-white font-semibold">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="p-3 rounded-lg bg-gray-200 text-black"
            placeholder="········"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="confirmPassword" className="text-white font-semibold">
            Verify password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="p-3 rounded-lg bg-gray-200 text-black"
            placeholder="········"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#0A9788] text-white py-2 px-4 rounded-full mt-2 w-fit disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </div>

        <p className="text-white text-sm mt-2 text-right">
          Already registered?{" "}
          <Link href="/login" className="underline">
            Sign in here
          </Link>
        </p>
      </form>
    </div>
  );
}
