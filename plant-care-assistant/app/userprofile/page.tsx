'use client';

import { useState, useEffect } from 'react';

export default function UserProfile() {
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = () => {
    setMessage('Profile updated successfully');
  };

  const handleDelete = () => {
    setMessage('Account deleted');
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <main
      role="main"
      aria-label="User profile editor"
      className="w-full flex justify-center px-4 py-12"
    >
      <section
        className="w-full max-w-md bg-[#01121A] text-white rounded-lg p-6 space-y-6"
        aria-labelledby="profile-form-heading"
      >
        <h1 id="profile-form-heading" className="text-lg font-semibold">
          Edit your personal infos
        </h1>

        {message && (
          <div
            role="status"
            className="bg-green-600 text-white text-sm px-4 py-2 rounded-md"
          >
            {message}
          </div>
        )}

        <form
          className="space-y-4"
          aria-describedby="profile-form-description"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div>
            <label htmlFor="username" className="block text-sm font-semibold mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="w-full rounded-md bg-gray-300 text-black px-3 py-2 focus:outline-none"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full rounded-md bg-gray-300 text-black px-3 py-2 focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="old-password" className="block text-sm font-semibold mb-1">
              Old password
            </label>
            <input
              id="old-password"
              name="old-password"
              type="password"
              className="w-full rounded-md bg-gray-300 text-black px-3 py-2 focus:outline-none"
              placeholder="********"
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-sm font-semibold mb-1">
              New password
            </label>
            <input
              id="new-password"
              name="new-password"
              type="password"
              className="w-full rounded-md bg-gray-300 text-black px-3 py-2 focus:outline-none"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label htmlFor="verify-password" className="block text-sm font-semibold mb-1">
              Verify password
            </label>
            <input
              id="verify-password"
              name="verify-password"
              type="password"
              className="w-full rounded-md bg-gray-300 text-black px-3 py-2 focus:outline-none"
              placeholder="Verify new password"
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="bg-[#B54747] hover:bg-red-700 text-white px-4 py-2 rounded-full transition"
              aria-label="Delete account"
            >
              Delete account
            </button>
            <button
              type="submit"
              className="bg-[#0A9788] hover:bg-teal-700 text-white px-6 py-2 rounded-full transition"
              aria-label="Save profile changes"
            >
              Save
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
