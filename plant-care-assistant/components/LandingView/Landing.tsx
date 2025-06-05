"use client";

import Logo from "@/components/logo";
import Link from "next/link";
import Icon from "@/components/icon";

export default function Homepage() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 py-6 pt-24 pb-28 space-y-6">

      {/* Logo centré */}
      <div className="flex justify-center">
        <Logo size={250} />
      </div>
      {/* Welcome text */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-white">WELCOME</h1>
        <p className="text-white text-lg">On your Plant Care Assistant !</p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-4 w-full">
        {/* Identification - sans lien */}
        <div className="bg-white rounded-xl p-4 flex items-center justify-between text-black">
          <div>
            <h2 className="font-sans font-bold text-lg text-black">Identification</h2>
            <p className="text-sm text-gray-600">Learn about plants !</p>
          </div>
          <Icon name="buttonIdentification" size={55} />
        </div>

        {/* Feed */}
        <Link href="/feed">
          <div className="bg-white rounded-xl p-4 flex items-center justify-between hover:shadow-md cursor-pointer text-black">
            <div>
              <h2 className="font-sans font-bold text-lg">Feed</h2>
              <p className="text-sm text-gray-600">See all the posts</p>
            </div>
            <Icon name="buttonFeed" size={55} />
          </div>
        </Link>

        {/* Calendar */}
        <Link href="/calendar">
          <div className="bg-white rounded-xl p-4 flex items-center justify-between hover:shadow-md cursor-pointer text-black">
            <div>
              <h2 className="font-sans font-bold text-lg text-black">Your calendar</h2>
              <p className="text-sm text-gray-600">Check your schedule</p>
            </div>
            <Icon name="buttonCalendar" size={55} />
          </div>
        </Link>
      </div>

      {/* Auth buttons */}
      <div className="flex gap-4 mt-4">
        <Link href="/login">
          <button type="submit" id="login" data-testid="loginButtonTest" className="bg-[#0A9788] text-white py-2 px-4 rounded-full mt-2 w-fit z-50">
              Login
          </button>
        </Link>
        <Link href="/register">
          <button type="submit" id="register" className="bg-[#0A9788] text-white py-2 px-4 rounded-full mt-2 w-fit z-50">
              Register
          </button>
        </Link>
      </div>
    </div>
  );
}
