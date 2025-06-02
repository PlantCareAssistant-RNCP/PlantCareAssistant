'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterForm() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <h2 className="text-white text-lg mb-2">Registration form</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-white font-semibold">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          className="p-3 rounded-lg bg-gray-200 text-black"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-white font-semibold">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="p-3 rounded-lg bg-gray-200 text-black"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-white font-semibold">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="p-3 rounded-lg bg-gray-200 text-black"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="confirmPassword" className="text-white font-semibold">Verify password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="p-3 rounded-lg bg-gray-200 text-black"
          required
        />
      </div>
      <div className="flex justify-end">
        <button type="submit" className="bg-[#0A9788] text-white py-2 px-4 rounded-full mt-2 w-fit">
            Register
        </button>
      </div>

      <p className="text-white text-sm mt-2 text-right">
        Already registered?{' '}
        <Link href="/login" className="underline">
          Sign in here
        </Link>
      </p>
    </form>
  );
}
