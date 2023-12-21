import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { UserAuth } from "../context/AuthContext";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

export default function Singup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [error, setError] = useState("");

  const { createUser } = UserAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const newUser = await createUser(email, password);
      // collection ref
      const colRef = collection(db, "users");
      // add collection data
      await addDoc(colRef, {
        userid: newUser.user.uid,
        email,
        password,
        status: "unlocked",
        name,
        position,
        last_login: new Date(),
      }).catch((err) => {
        console.log(err.message);
      });

      navigate("/account");
    } catch (e) {
      setError(e.message);
      console.log(e.message);
    }
  };
  return (
    <div className="max-w-[700px] mx-auto my-16 p-4">
      <div>
        <h1 className="text-2xl font-bold py-2">Sign up for a free Account</h1>
        <p className="py-2">
          Already have an account yet?{" "}
          <Link to="/" className="underline">
            Sigh In.
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
        <div className="flex flex-col py-2">
          <label className="py-2 font-medium">Name</label>
          <input
            onChange={(e) => setName(e.target.value)}
            className="border p-3"
            type="name"
            required
          />
        </div>
        <div className="flex flex-col py-2">
          <label className="py-2 font-medium">Position</label>
          <input
            onChange={(e) => setPosition(e.target.value)}
            className="border p-3"
            type="status"
            required
          />
        </div>
        {error && <span className="text-red-600">{error}</span>}
        <button className="border border-blue-500 bg-blue-600 hover:bg-blue-500 w-full p-4 my-2 text-white">
          Sign Up
        </button>
      </form>
    </div>
  );
}
