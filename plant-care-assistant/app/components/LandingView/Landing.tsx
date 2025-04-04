"use client";
import React, { useState } from "react";
import Image from "next/image";
import Login from "../LoginView/Login";
import Registration from "../RegistrationView/Registration";

const Landing = () => {
  const [isLoginModal, setIsLoginModal] = useState(false);
  const [isRegistrationModal, setIsRegistrationModal] = useState(false);

  const openLoginModal = () => {
    setIsLoginModal(true);
  };

  const closeLoginModal = () => {
    setIsLoginModal(false);
  };

  const openRegistrationModal = () => {
    setIsRegistrationModal(true);
  };

  const closeRegistrationModal = () => {
    setIsRegistrationModal(false);
  };

  return (
    <div
      className="bg-cover bg-center h-screen flex justify-center items-center relative"
      style={{ backgroundImage: "url('/landing_background.jpg')" }}
    >
      <div className="bg-black bg-opacity-50 w-full h-full flex justify-center items-center">
        <div className="text-center text-white flex flex-col items-center">
          <Image
            src="/PlantCare_Logo.png"
            alt="PlantCareAssistant Logo"
            width={500}
            height={500}
            style={{ filter: "brightness(1.9) contrast(1.5)" }}
          />
          <h1 className="text-5xl mb-5 text-leaf">Plant Care Assistant</h1>
          <div className="flex justify-around w-full mt-5">
            {/* Placeholder for login/register components */}
            <div
              className="bg-white bg-opacity-20 p-5 rounded-lg w-[45%] cursor-pointer"
              onClick={openLoginModal}
            >
              Login Component
            </div>
            <div
              className="bg-white bg-opacity-20 p-5 rounded-lg w-[45%] cursor-pointer"
              onClick={openRegistrationModal}
            >
              Register Component
            </div>
          </div>
        </div>
      </div>
      {/*Modal for Login*/}
      {isLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-white"
              onClick={closeLoginModal}
            >
              ✖
            </button>
            <Login />
          </div>
        </div>
      )}

      {isRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-white"
              onClick={closeRegistrationModal}
            >
              ✖
            </button>
            <Registration />
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
