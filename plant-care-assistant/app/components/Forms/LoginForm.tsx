'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <h2 className="text-white text-lg mb-2">Login form</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-white font-semibold">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-3 rounded-lg bg-gray-200 text-black"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-white font-semibold">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 rounded-lg bg-gray-200 text-black"
          required
        />
      </div>
    
      <div className="flex justify-end">
        <button type="submit" className="bg-[#0A9788] text-white py-2 px-4 rounded-full mt-2 w-fit">
            Sign in
        </button>
      </div>

      <p className="text-white text-sm mt-2 text-right">
        Not registered yet?{' '}
        <Link href="/register" className="underline">
          Create an account here
        </Link>
      </p>
    </form>
  );
}
