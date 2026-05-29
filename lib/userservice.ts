import { API_BASE, readError, readJson } from "@/lib/api";
import {
  RqtAccount,
  RspUser,
  UserInfo,
  UserUpdateDto,
} from "@/interfaces/interface";

const accountUrl = `${API_BASE}Account/`;
const userUrl = `${API_BASE}User/`;

const toRqtAccount = (user: UserInfo): RqtAccount => ({
  Username: user.username,
  Password: user.password,
});

const normalizeToken = (token: string) =>
  token.trim().replace(/^Bearer\s+/i, "");

const extractToken = (text: string) => {
  if (!text) return "";

  try {
    const data = JSON.parse(text) as
      | string
      | {
          token?: string;
          Token?: string;
          accessToken?: string;
          AccessToken?: string;
          jwt?: string;
          Jwt?: string;
        };

    if (typeof data === "string") return normalizeToken(data);

    return normalizeToken(
      data.token ??
        data.Token ??
        data.accessToken ??
        data.AccessToken ??
        data.jwt ??
        data.Jwt ??
        "",
    );
  } catch {
    return normalizeToken(text);
  }
};

export const authHeaders = (): HeadersInit => {
  if (typeof window === "undefined") {
    return {
      "Content-Type": "application/json",
    };
  }

  const token = normalizeToken(localStorage.getItem("token") ?? "");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const normalizeUser = (user: any): RspUser | null => {
  if (!user) return null;

  const id = user.id ?? user.Id;

  if (id === undefined || id === null) return null;

  const normalizeUserList = (users: any): RspUser[] => {
    if (!Array.isArray(users)) return [];

    return users
      .map((item) => normalizeUser(item))
      .filter((item): item is RspUser => item !== null);
  };

  return {
    id,
    username: user.username ?? user.Username ?? "",
    points: user.points ?? user.Points ?? 0,
    streak: user.streak ?? user.Streak ?? 0,

    outgoingRequests: normalizeUserList(
      user.outgoingRequests ?? user.OutgoingRequests,
    ),

    incomingRequests: normalizeUserList(
      user.incomingRequests ?? user.IncomingRequests,
    ),

    friends: normalizeUserList(user.friends ?? user.Friends),

    blocked: normalizeUserList(user.blocked ?? user.Blocked),

    isPointsPrivate: user.isPointsPrivate ?? user.IsPointsPrivate ?? false,
    isStreakPrivate: user.isStreakPrivate ?? user.IsStreakPrivate ?? false,
    isDeleted: user.isDeleted ?? user.IsDeleted ?? false,
  };
};

export const createAccount = async (user: UserInfo) => {
  const res = await fetch(`${accountUrl}Sign-Up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toRqtAccount(user)),
  });

  if (!res.ok) {
    console.log(await readError(res, "Account creation failed"));
    return false;
  }

  return true;
};

export const login = async (user: UserInfo) => {
  const res = await fetch(`${accountUrl}Sign-In`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toRqtAccount(user)),
  });

  if (!res.ok) {
    console.log(await readError(res, "Login failed"));
    return null;
  }

  const text = await res.text();
  const token = extractToken(text);

  if (!token) {
    console.log("No token found in Sign-In response.");
    return null;
  }

  localStorage.setItem("token", token);
  localStorage.setItem("username", user.username);

  try {
    const data = JSON.parse(text) as {
      user?: any;
      User?: any;
    };

    const returnedUser = normalizeUser(data.user ?? data.User);

    if (returnedUser) {
      localStorage.setItem("user", JSON.stringify(returnedUser));
      localStorage.setItem("username", returnedUser.username);
      return token;
    }
  } catch {
    // Raw token response. Fetch the user below.
  }

  const signedInUser = await getUserByUsername(user.username);

  if (signedInUser) {
    localStorage.setItem("user", JSON.stringify(signedInUser));
    localStorage.setItem("username", signedInUser.username);
  }

  return token;
};

export const getAllUsers = async (): Promise<RspUser[]> => {
  const res = await fetch(`${userUrl}GetAll`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!res.ok) {
    console.log(await readError(res, "Failed to get users"));
    return [];
  }

  const users = (await readJson<any[]>(res)) ?? [];

  return users
    .map((user) => normalizeUser(user))
    .filter((user): user is RspUser => user !== null);
};

export const getUserById = async (id: number): Promise<RspUser | null> => {
  const res = await fetch(`${userUrl}GetOne/Id/${id}`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!res.ok) {
    console.log(await readError(res, "Failed to get user by id"));
    return null;
  }

  const user = await readJson<any>(res);

  return normalizeUser(user);
};

export const getUserByUsername = async (
  username: string,
): Promise<RspUser | null> => {
  const res = await fetch(
    `${userUrl}GetOne/Username/${encodeURIComponent(username)}`,
    {
      cache: "no-store",
      headers: authHeaders(),
    },
  );

  if (!res.ok) {
    console.log(await readError(res, "Failed to get user by username"));
    return null;
  }

  const user = await readJson<any>(res);

  return normalizeUser(user);
};

export const updateUser = async (
  dto: UserUpdateDto,
): Promise<RspUser | null> => {
  const res = await fetch(`${userUrl}Update`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    throw new Error(await readError(res, "Failed to update user"));
  }

  const user = await readJson<any>(res);
  const normalized = normalizeUser(user);

  if (normalized) {
    localStorage.setItem("user", JSON.stringify(normalized));
    localStorage.setItem("username", normalized.username);
  }

  return normalized;
};
export const updateUserPointsAndStreak = async ({
  id,
  points,
  streak,
}: {
  id: number;
  points: number;
  streak: number;
}): Promise<RspUser | null> => {
  return updateUser({
    id,

    bUsername: false,
    vUsername: "",

    bPassword: false,
    vPasswordOld: "",
    vPasswordNew: "",

    bPoints: true,
    vPoints: points,

    bStreak: true,
    vStreak: streak,

    bIsPointsPrivate: false,
    vIsPointsPrivate: false,

    bIsStreakPrivate: false,
    vIsStreakPrivate: false,

    bIsDeleted: false,
    vIsDeleted: false,
  });
};

export const refreshLoggedInUser = async (): Promise<RspUser | null> => {
  if (typeof window === "undefined") return null;

  const username = localStorage.getItem("username");

  if (!username) return null;

  const user = await getUserByUsername(username);

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("username", user.username);
  }

  return user;
};

export const deleteUser = async (id: number): Promise<boolean> => {
  const res = await fetch(`${userUrl}Delete/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(await readError(res, "Failed to delete user"));
  }

  logout();

  return true;
};

export const acceptOrCreateFriend = async (
  selfUsername: string,
  themUsername: string,
) => {
  const res = await fetch(
    `${userUrl}Friend/AcceptOrCreate/${encodeURIComponent(
      selfUsername,
    )}/${encodeURIComponent(themUsername)}`,
    {
      method: "POST",
      headers: authHeaders(),
    },
  );

  if (!res.ok) {
    throw new Error(await readError(res, "Friend request failed"));
  }

  return true;
};

export const rejectOrDeleteFriend = async (
  selfUsername: string,
  themUsername: string,
) => {
  const res = await fetch(
    `${userUrl}Friend/RejectOrDelete/${encodeURIComponent(
      selfUsername,
    )}/${encodeURIComponent(themUsername)}`,
    {
      method: "POST",
      headers: authHeaders(),
    },
  );

  if (!res.ok) {
    throw new Error(await readError(res, "Friend removal failed"));
  }

  return true;
};

export const blockUser = async (
  selfUsername: string,
  themUsername: string,
) => {
  const res = await fetch(
    `${userUrl}Block/Create/${encodeURIComponent(
      selfUsername,
    )}/${encodeURIComponent(themUsername)}`,
    {
      method: "POST",
      headers: authHeaders(),
    },
  );

  if (!res.ok) {
    throw new Error(await readError(res, "Block failed"));
  }

  return true;
};

export const unblockUser = async (
  selfUsername: string,
  themUsername: string,
) => {
  const res = await fetch(
    `${userUrl}Block/Delete/${encodeURIComponent(
      selfUsername,
    )}/${encodeURIComponent(themUsername)}`,
    {
      method: "POST",
      headers: authHeaders(),
    },
  );

  if (!res.ok) {
    throw new Error(await readError(res, "Unblock failed"));
  }

  return true;
};

export const checkToken = () => {
  if (typeof window === "undefined") return false;

  return !!localStorage.getItem("token");
};

export const getToken = () => {
  if (typeof window === "undefined") return "";

  return localStorage.getItem("token") ?? "";
};

export function loggedInData() {
  if (typeof window === "undefined") return null;

  const rawUser = localStorage.getItem("user");

  if (!rawUser) return null;

  try {
    const user = normalizeUser(JSON.parse(rawUser));

    if (!user) {
      localStorage.removeItem("user");
      return null;
    }

    return user;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export const logout = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("username");
};