"use client";

import React, { useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { useRouter } from "next/navigation";

const Registration: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    // Validate password strength
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signUp(formData.email, formData.password, formData.username);
      router.push("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-darkest p-8 rounded-lg shadow-lg w-full h-full flex flex-col justify-center items-center">
      <h2 className="text-2xl font-bold text-plant mb-6 text-center">
        Register
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-md"
      >
        <div className="flex flex-col">
          <label htmlFor="username" className="text-plant mb-2">
            Username:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-verdigris-light"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="email" className="text-plant mb-2">
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-verdigris-light"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="password" className="text-plant mb-2">
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-verdigris-light"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="confirmPassword" className="text-plant mb-2">
            Confirm Password:
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-verdigris-light"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="bg-verdigris-light text-plant py-2 px-4 rounded-md hover:bg-verdigris-dark transition duration-300"
        >
          {isLoading ? "Creating Account..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Registration;