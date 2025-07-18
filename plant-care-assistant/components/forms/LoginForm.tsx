"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@components/common/Logo";
import { useAuth } from "../../providers/AuthProvider";
import { useRouter } from "next/navigation";
import logger from "@utils/logger"


export default function LoginForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);
      await signIn(form.email, form.password);
      router.push("/dashboard"); // Redirect to dashboard after successful login
    } catch (error) {
      logger.error("Login error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to sign in. Please check your credentials."
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
        <h2 className="text-white text-lg mb-2">Login form</h2>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

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
            placeholder="·········"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            id="signIn"
            className="bg-[#0A9788] text-white py-2 px-4 rounded-full mt-2 w-fit disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </div>

        <p className="text-white text-sm mt-2 text-right">
          Not registered yet?{" "}
          <Link href="/register" className="underline">
            Create an account here
          </Link>
        </p>
      </form>
    </div>
  );
}
