import { Token, UserInfo } from "@/interfaces/interface";

const url = "https://csa-2526-studysync-api-b6bue3aue8hka0ea.westus3-01.azurewebsites.net/api/user/"; 

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
    const res = await fetch(url + "Login",{
        method: "POST",
        headers: {
            "Content-Type": "application/json" 
        },
        body: JSON.stringify(user)
    });
    if(!res.ok){
        const data = await res.json();
        const message = data.messaage;
        console.log(message);
        return null;
    }
    const data: Token = await res.json();
    return data;
}

export const getUserByUsername = async (username: string) => {
  const res = await fetch(url + `GetOneByUsername/${username}`);

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
  localStorage.setItem("user", JSON.stringify(data));
  return data;
};

export const checkToken = () => {
    const token = localStorage.getItem('token');
    return !!token;
}

export const getToken = () => localStorage.getItem('token')?? '';

export const loggedInData = () => JSON.parse(localStorage.getItem('user')!);