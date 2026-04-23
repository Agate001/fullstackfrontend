"use client";

import NavBarComponent from "@/components/nav";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createAccount, getUserByUsername, login } from "@/lib/userservice";

export default function LoginPage() {
  const { push } = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  // const [email, setEmail] = useState(""); later feature
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

      const user = {
        username,
        password,
      };

      try {
        const result = await createAccount(user);

        if (result) {
          alert("Account created successfully");
          setMode("login");
          setPassword("");
          setRePassword("");
        } else {
          alert("Account already exists");
        }
      } catch (error) {
        console.error(error);
        alert("Signup failed");
      }
    } else {
      const user = {
        username,
        password,
      };

      try {
        const token = await login(user);

        if (token) {
          if (typeof window !== "undefined") {
            // clear old stale data
            localStorage.removeItem("user");

            // store token
            localStorage.setItem("token", token);

            const freshUser = await getUserByUsername(username);

            if (!freshUser || !freshUser.id) {
              alert("Failed to load user data");
              return;
            }

            // save the correct user
            localStorage.setItem("user", JSON.stringify(freshUser));

            push("/home");
          }
        } else {
          alert("Invalid username or password");
        }
      } catch (error) {
        console.error(error);
        alert("Login failed");
      }
    }
  };

  return (
    <div>
      <main className="min-h-screen w-full bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Background.png)] bg-cover bg-center flex items-center justify-center">
        <div className="w-105 rounded-[28px] bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Card.png)] bg-cover bg-center p-10 shadow-md">
          <h1 className="font-large text-[2.6rem] text-center mb-8">
            {mode === "login" ? "Login" : "Sign Up"}
          </h1>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="font-small text-[1.4rem]">User</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border border-black w-50 px-2 py-1 "
              />
            </div>

            {/* {mode === "signup" && (
              <div className="flex items-center justify-between">
                <label className="font-small text-[1.4rem]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border border-black w-50 px-2 py-"
                />
              </div>
            )}                                  LATER FEATURE*/}

            <div className="flex items-center justify-between">
              <label className="font-small text-[1.4rem]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-black w-50 px-2 py-1 "
              />
            </div>

            {mode === "signup" && (
              <div className="flex items-center justify-between">
                <label className="font-small text-[1.4rem]">Re-Password</label>
                <input
                  type="password"
                  value={rePassword}
                  onChange={(e) => setRePassword(e.target.value)}
                  className="border border-black w-50 px-2 py-1"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center mt-8 gap-3">
            <button
              onClick={handleSubmit}
              className="font-large bg-yellow-200 px-6 py-1 text-[2rem] shadow hover:scale-105 active:scale-95 transition"
            >
              Enter
            </button>

            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-small text-[1.1rem]"
            >
              {mode === "login" ? "Sign Up" : "Login"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
