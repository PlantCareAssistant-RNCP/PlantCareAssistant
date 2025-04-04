"use client";

import React from "react";
import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("email", email);
    console.log("password", password);
  };
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   try {
  //     const res = await fetch("/api/auth/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     if (!res.ok) {
  //       throw new Error("Failed to login");
  //     }

  //     const data = await res.json();
  //     setMessage(data.message);
  //   } catch (error) {
  //     setMessage("An error occured. Please try again.");
  //     console.error(error);
  //   }
  // };

  return (
    <div className="bg-darkest p-8 rounded-lg shadow-lg w-full h-full flex flex-col justify-center items-center">
      <h2 className="text-2xl font-bold text-plant mb-6 text-center">Login</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-md"
      >
        <div className="flex flex-col">
          <label htmlFor="email" className="text-plant mb-2">
            Email:
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-verdigris-light"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password" className="text-plant mb-2">
            Password:
          </label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-verdigris-light"
          />
        </div>
        <button
          type="submit"
          className="bg-verdigris-light text-plant py-2 px-4 rounded-md hover:bg-verdigris-dark transition duration-300"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Login;
