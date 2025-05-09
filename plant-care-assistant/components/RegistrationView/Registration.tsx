import React, { useState } from "react";

const Registration: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await fetch("/api/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       });

//       if (response.ok) {
//         alert("Registration successful!");
//         setFormData({ username: "", email: "", password: "" });
//       } else {
//         alert("Registration failed. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       alert("An error occurred. Please try again.");
//     }
//   };
const handleSubmit = (event:React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(formData)
  };

  return (
    <div className="bg-darkest p-8 rounded-lg shadow-lg w-full h-full flex flex-col justify-center items-center">
      <h2 className="text-2xl font-bold text-plant mb-6 text-center">
        Register
      </h2>
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
        <button
          type="submit"
          className="bg-verdigris-light text-plant py-2 px-4 rounded-md hover:bg-verdigris-dark transition duration-300"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Registration;
