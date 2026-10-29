

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { FaEnvelope, FaLock } from "react-icons/fa";

// const LoginPage = ({ setToken }) => {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");
//     const navigate = useNavigate();

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         try {
//             const res = await axios.post("http://localhost:3000/api/auth/login", { email, password });
//             localStorage.setItem("token", res.data.token); // Store token
//             setToken(res.data.token); // Update token state
//             navigate("/dashboard"); // Redirect to dashboard
//         } catch (err) {
//             setError("Invalid email or password. Try again!");
//         }
//     };

//     return (
//         <div className="min-h-screen flex">
//             {/* Left Section */}
//             <div className="w-1/2 bg-white flex flex-col justify-center items-center">
//                 <img src="/src/assets/images/logologin.png" alt="Wise Academy Logo" className="h-45" />
//             </div>

//             {/* Right Section */}
//             <div className="w-1/2 bg-white flex flex-col justify-center px-16">
//                 <form className="w-full" onSubmit={handleLogin}>
//                     {error && <p className="text-red-500 text-center">{error}</p>}

//                     {/* Email Input */}
//                     <div className="mb-6">
//                         <label className="block mb-2 text-gray-600" htmlFor="email">Email</label>
//                         <div className="relative">
//                             <input
//                                 type="email"
//                                 id="email"
//                                 value={email}
//                                 onChange={(e) => setEmail(e.target.value)}
//                                 className="w-full border border-gray-300 rounded-lg px-10 py-3 bg-white focus:ring-2 focus:ring-blue-500"
//                                 placeholder="Email"
//                                 required
//                             />
//                             <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
//                                 <FaEnvelope className="h-5 w-5" />
//                             </span>
//                         </div>
//                     </div>

//                     {/* Password Input */}
//                     <div className="mb-6">
//                         <label className="block mb-2 text-gray-600" htmlFor="password">Password</label>
//                         <div className="relative">
//                             <input
//                                 type="password"
//                                 id="password"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 className="w-full border border-gray-300 rounded-lg px-10 py-3 bg-white focus:ring-2 focus:ring-blue-500"
//                                 placeholder="Password"
//                                 required
//                             />
//                             <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
//                                 <FaLock className="h-5 w-5" />
//                             </span>
//                         </div>
//                     </div>

//                     {/* Forgot Password */}
//                     <div className="text-right mb-6">
//                         <a href="#" className="text-blue-500 text-sm">Forgot Password?</a>
//                     </div>

//                     {/* Login Button */}
//                     <button
//                         type="submit"
//                         className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600"
//                     >
//                         Login
//                     </button>
//                 </form>

//                 {/* Create Account */}
//                 <div className="text-center mt-6">
//                     <p className="text-gray-600">
//                         Don't have an account? <a href="/src/core/public/pages/Signup" className="text-blue-500 font-medium">Create account</a>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default LoginPage;
