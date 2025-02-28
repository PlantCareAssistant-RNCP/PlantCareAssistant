// "use client";

// import { useState } from "react";

// export default function RegisterPage() {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [message, setMessage] = useState("");

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         const res = await fetch("/api/auth/register", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email, password }),
//         });

//         const data = await res.json();
//         setMessage(data.message);
//     };

//     return (
//         <div>
//             <h1>Inscription</h1>
//             <form onSubmit={handleSubmit}>
//                 <input 
//                     type="email" 
//                     placeholder="Email" 
//                     value={email} 
//                     onChange={(e) => setEmail(e.target.value)} 
//                     required 
//                 />
//                 <input 
//                     type="password" 
//                     placeholder="Mot de passe" 
//                     value={password} 
//                     onChange={(e) => setPassword(e.target.value)} 
//                     required 
//                 />
//                 <button type="submit">S'inscrire</button>
//             </form>
//             {message && <p>{message}</p>}
//         </div>
//     );
// }


export default function Register() {
    return <div>Registration page</div>;
}

