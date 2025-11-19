// // src/pages/AdminLogin.tsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAdmin } from "../context/AdminContext";

// const AdminLogin: React.FC = () => {
//   const { login } = useAdmin();
//   const navigate = useNavigate();

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     const form = e.currentTarget as HTMLFormElement;
//     const email = (form.elements[0] as HTMLInputElement).value;
//     const password = (form.elements[1] as HTMLInputElement).value;

//     try {
//       await login(email, password); // Calls AdminContext login
//       navigate("/admin"); // Redirect to admin dashboard
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message || "Login failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
//       <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">

//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-primary rounded-xl mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4">
//             AD
//           </div>
//           <h1 className="text-2xl font-bold text-gray-800">Admin Portal</h1>
//           <p className="text-gray-500 mt-2">Secure access only.</p>
//         </div>

//         {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

//         <form onSubmit={handleLogin} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Admin Email
//             </label>
//             <input
//               type="email"
//               placeholder="admin@example.com"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Password
//             </label>
//             <input
//               type="password"
//               placeholder="Enter your admin password"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
//           >
//             {loading ? "Authenticating..." : "Login as Admin"}
//           </button>
//         </form>

//         {/* Back to normal login */}
//         <div className="mt-6 text-center text-xs text-gray-400">
//           <p>
//             Not an admin?{" "}
//             <span
//               className="text-primary font-medium cursor-pointer"
//               onClick={() => navigate("/")}
//             >
//               Go back
//             </span>
//           </p>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default AdminLogin;
