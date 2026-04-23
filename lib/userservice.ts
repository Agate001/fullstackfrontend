import { UserInfo } from "@/interfaces/interface";

const url =
  "https://csa-2526-studysync-api-b6bue3aue8hka0ea.westus3-01.azurewebsites.net/api/user/";

export const createAccount = async (user: UserInfo) => {
  const res = await fetch(url + "Create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    console.log(data?.message || "Account creation failed");
    return false;
  }

  console.log("Acc created", data);
  return true;
};

export const login = async (user: UserInfo) => {
  const res = await fetch(url + "Login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = data?.message || "Login failed";
    console.log(message);
    return null;
  }

  // treat token as plain text, not JSON object
  const token = await res.text();

  if (!token) {
    console.log("No token returned");
    return null;
  }

  localStorage.setItem("token", token);
  return token;
};

export const getUserByUsername = async (username: string) => {
  const res = await fetch(url + `Verbose/GetOneByUsername/${username}`);

  if (!res.ok) {
    console.log("Failed to get user");
    return null;
  }

  const text = await res.text();

  if (!text) {
    console.log("No user data returned");
    return null;
  }

  const data = JSON.parse(text);
  return data;
};

export const checkToken = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

export const getToken = () => localStorage.getItem("token") ?? "";

export function loggedInData() {
  if (typeof window === "undefined") return null;

  const rawUser = localStorage.getItem("user");
  if (!rawUser) return null;

  try {
    const user = JSON.parse(rawUser);

    if (!user?.id) {
      localStorage.removeItem("user");
      return null;
    }

    return user;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}