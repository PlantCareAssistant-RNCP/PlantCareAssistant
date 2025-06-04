'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/logo';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RegisterForm() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      // Créer un utilisateur dans Supabase
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Ajouter le profil utilisateur dans votre base de données
      const response = await fetch('/api/auth/create-user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: data.user?.id, // ID utilisateur généré par Supabase
          username: form.username,
        }),
      });

      if (!response.ok) {
        const responseError = await response.json();
        setError(responseError.error || 'Failed to create user profile');
        return;
      }

      setSuccessMessage('Account created successfully! Please check your email to confirm.');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8 space-y-6">
      <Logo size={200} />
      
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
            placeholder="JaneDoe123"
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
            placeholder="janeDoe123@example.com"
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
            placeholder="········"
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
            placeholder="········"
            required
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-[#0A9788] text-white py-2 px-4 rounded-full mt-2 w-fit">
              Register
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {successMessage && <p className="text-green-500 text-sm mt-2">{successMessage}</p>}

        <p className="text-white text-sm mt-2 text-right">
          Already registered?{' '}
          <Link href="/login" className="underline">
            Sign in here
          </Link>
        </p>
      </form>
    </div>
  );
}
