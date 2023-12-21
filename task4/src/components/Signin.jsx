import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { UserAuth } from "../context/AuthContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signIn } = UserAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const colRef = collection(db, "users");
      const q = query(colRef, where("email", "==", email));

      const getUser = async () => {
        await getDocs(q)
          .then((res) => {
            if (res.size > 0) {
              const user = res.docs[0].data();
              console.log("user.status", user.status);
              if (user.status === "blocked") {
                setError("The user is blocked");
                return false;
              }
              return true;
            } else {
              setError("The user doesn't exist");
              return null;
            }
          })
          .catch((err) => {
            console.error(err.message);
            return null;
          });
      };

      if (await getUser()) {
        await signIn(email, password);
        navigate("/account");
      }
    } catch (e) {
      setError(e.message);
      console.log(e.message);
    }
  };

  return (
    <div className="max-w-[700px] mx-auto my-16 p-4">
      <div>
        <h1 className="text-2xl font-bold py-2">Sign in to your Account</h1>
        <p className="py-2">
          Don't have an account yet?{" "}
          <Link to="/signup" className="underline">
            Sign Up.
          </Link>
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col py-2">
          <label className="py-2 font-medium">Email Address</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            className="border p-3"
            type="emai"
            required
          />
        </div>
        <div className="flex flex-col py-2">
          <label className="py-2 font-medium">Password</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            className="border p-3"
            type="password"
            required
          />
        </div>
        {error && <span className="text-red-600">{error}</span>}
        <button className="border border-blue-500 bg-blue-600 hover:bg-blue-500 w-full p-4 my-2 text-white">
          Sign In
        </button>
      </form>
    </div>
  );
}
