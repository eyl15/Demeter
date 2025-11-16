import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LogIn,
  UserPlus,
  LogOut,
  Upload,
  FileJson,
  Image as ImageIcon,
  Mail,
  Lock,
  Chrome,
} from "lucide-react";
import {
  auth,
  signUpWithEmail,
  signInWithEmail,
  logout,
  onAuthStateChanged,
  signInWithGoogle,
} from "../firebaseConfig";
import type { User } from "firebase/auth";

function AuthPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // ---------------- Auth ----------------
  const handleSignUp = async () => {
    try {
      await signUpWithEmail(email, password);
      alert("Sign-up successful!");
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithEmail(email, password);
      alert("Sign-in successful!");
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      alert("Logged out");
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // ---------------- Upload ----------------
  const uploadToServer = async (file: File) => {
    if (!user) return alert("You must be logged in.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uid", user.uid); // required for user-specific path

    try {
      const res = await fetch("${import.meta.env.VITE_API_URL}/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      alert("Upload successful! URL:\n" + data.url);
    } catch (e: any) {
      alert("Upload failed: " + e.message);
    }
  };

  const handleUploadFile = () => {
    if (!selectedFile) return alert("Choose a file first.");
    uploadToServer(selectedFile);
  };

  const handleUploadImage = () => {
    if (!selectedImage) return alert("Choose an image first.");
    uploadToServer(selectedImage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Info Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-lg p-6 md:col-span-2"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl mb-2">Account</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </motion.button>
              </div>
            </motion.div>

            {/* Upload JSON File Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                  <FileJson className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl">Upload JSON File</h2>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                      className="hidden"
                      id="json-upload"
                    />
                    <label htmlFor="json-upload" className="cursor-pointer">
                      <FileJson className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {selectedFile
                          ? selectedFile.name
                          : "Click to select JSON file"}
                      </p>
                    </label>
                  </div>
                </label>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUploadFile}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </motion.button>
              </div>
            </motion.div>

            {/* Upload Image Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl">Upload Image/PDF</h2>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        setSelectedImage(e.target.files?.[0] || null)
                      }
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {selectedImage
                          ? selectedImage.name
                          : "Click to select image or PDF"}
                      </p>
                    </label>
                  </div>
                </label>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUploadImage}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
                </motion.button>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl mb-2">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-gray-600">
                  {isSignUp
                    ? "Sign up to get started"
                    : "Sign in to your account"}
                </p>
              </div>

              <div className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Sign In/Up Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={isSignUp ? handleSignUp : handleSignIn}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  {isSignUp ? (
                    <UserPlus className="w-4 h-4" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  {isSignUp ? "Sign Up" : "Sign In"}
                </motion.button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Sign In */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <Chrome className="w-5 h-5" />
                  Sign in with Google
                </motion.button>

                {/* Toggle Sign In/Up */}
                <div className="text-center mt-6">
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {isSignUp
                      ? "Already have an account? Sign in"
                      : "Don't have an account? Sign up"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
