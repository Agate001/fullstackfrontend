"use client";

import { BookOpenCheck, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createAccount, getUserByUsername, login } from "@/lib/userservice";

export default function LoginPage() {
  const { push } = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  const handleSubmit = async () => {
    if (!username || !password) {
      alert("Please fill in username and password");
      return;
    }

    if (mode === "signup") {
      if (password !== rePassword) {
        alert("Passwords do not match");
        return;
      }

      try {
        const result = await createAccount({ username, password });
        if (!result) {
          alert("Account already exists");
          return;
        }

        alert("Account created successfully");
        setMode("login");
        setPassword("");
        setRePassword("");
      } catch (error) {
        console.error(error);
        alert("Signup failed");
      }

      return;
    }

    try {
      const token = await login({ username, password });

      if (!token) {
        alert("Invalid username or password");
        return;
      }

      localStorage.removeItem("user");
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);

      const freshUser = await getUserByUsername(username);
      if (!freshUser?.id) {
        alert("Failed to load user data");
        return;
      }

      localStorage.setItem("user", JSON.stringify(freshUser));
      push("/home");
    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-6 py-10 text-[#1e2429]">
      <section className="w-full max-w-[660px] rounded-3xl border border-[#f0d7bd] bg-white/82 px-12 py-14 shadow-[0_24px_80px_rgba(120,70,20,0.16)] backdrop-blur">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-[#f05a1a]">
            <BookOpenCheck size={52} strokeWidth={1.8} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">StudySync</h1>
          <h2 className="mt-8 text-4xl font-extrabold">
            {mode === "login" ? "Welcome back!" : "Create account"}
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            {mode === "login"
              ? "Log in to continue your journey and stay on track."
              : "Start tracking progress and building better habits."}
          </p>
        </div>

        <div className="space-y-7">
          <label className="block">
            <span className="mb-3 block font-semibold">Email</span>
            <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <Mail size={22} className="text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your email or username"
                className="w-full bg-transparent text-base text-slate-800 placeholder:text-slate-500"
              />
            </div>
          </label>

          <label className="block">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold">Password</span>
              {mode === "login" && (
                <button className="text-sm font-semibold text-[#ef4b17]" type="button">
                  Forgot password?
                </button>
              )}
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <LockKeyhole size={22} className="text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-transparent text-base text-slate-800 placeholder:text-slate-500"
              />
            </div>
          </label>

          {mode === "signup" && (
            <label className="block">
              <span className="mb-3 block font-semibold">Confirm password</span>
              <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <LockKeyhole size={22} className="text-slate-500" />
                <input
                  type="password"
                  value={rePassword}
                  onChange={(e) => setRePassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full bg-transparent text-base text-slate-800 placeholder:text-slate-500"
                />
              </div>
            </label>
          )}
        </div>

        {mode === "login" && (
          <label className="mt-7 flex items-center gap-3 text-base">
            <input type="checkbox" className="h-4 w-4 accent-[#f05a1a]" />
            Remember me
          </label>
        )}

        <button
          onClick={handleSubmit}
          className="mt-8 w-full rounded-lg bg-[#ef3f05] py-4 text-lg font-bold text-white shadow-sm transition hover:bg-[#d93800] active:scale-[0.99]"
        >
          {mode === "login" ? "Log In" : "Sign Up"}
        </button>

        <p className="mt-10 text-center text-base text-slate-600">
          {mode === "login" ? "Don’t have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="font-semibold text-[#ef4b17]"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </section>
    </main>
  );
}
