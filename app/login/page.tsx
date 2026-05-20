"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Login successful");
      router.push("/home");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">Login</h1>

        <input
          className="w-full p-3 mb-4 rounded-xl bg-white text-black"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 rounded-xl bg-white text-black"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full bg-white text-black p-3 rounded-xl font-semibold"
        >
          Login
        </button>
      </div>
    </main>
  );
}