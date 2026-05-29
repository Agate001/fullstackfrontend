"use client";

import MessagePopup from "@/components/MessagePopUp";
import NavBarComponent from "@/components/nav";
import type { RspUser } from "@/interfaces/interface";
import {
  acceptOrCreateFriend,
  blockUser,
  getAllUsers,
  getUserByUsername,
  rejectOrDeleteFriend,
  unblockUser,
} from "@/lib/userservice";
import { Ban, Search, Trophy, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type UserMini = Pick<
  RspUser,
  | "id"
  | "username"
  | "points"
  | "streak"
  | "isPointsPrivate"
  | "isStreakPrivate"
>;

const getLoggedInUsername = () => {
  if (typeof window === "undefined") return null;

  const username = localStorage.getItem("username");

  if (username) {
    return username;
  }

  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    const parsed = JSON.parse(user);
    return parsed.username || parsed.Username || null;
  } catch {
    return user;
  }
};

function publicPoints(user: UserMini) {
  return user.isPointsPrivate ? "Private" : `${user.points ?? 0} pts`;
}

export default function FriendsPage() {
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<RspUser | null>(null);
  const [searchedUser, setSearchedUser] = useState<RspUser | null>(null);
  const [allUsers, setAllUsers] = useState<RspUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState("");

  const loadCurrentUserFriends = async () => {
    try {
      setPageLoading(true);

      const self = getLoggedInUsername();

      if (!self) {
        setPopupMessage("Please sign in again.");
        return;
      }

      const [freshUser, users] = await Promise.all([
        getUserByUsername(self),
        getAllUsers(),
      ]);

      setCurrentUser(freshUser);
      setAllUsers(users);

      localStorage.setItem("user", JSON.stringify(freshUser));
      localStorage.setItem("username", freshUser.username);
    } catch (err) {
      console.error(err);
      setPopupMessage(
        err instanceof Error ? err.message : "Failed to load friends."
      );
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUserFriends();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setSearchedUser(null);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setSearchedUser(await getUserByUsername(search.trim()));
      } catch (err) {
        console.error(err);
        setSearchedUser(null);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(timeout);
  }, [search]);

  const friendRequests = currentUser?.incomingRequests ?? [];
  const outgoingRequests = currentUser?.outgoingRequests ?? [];
  const friends = currentUser?.friends ?? [];
  const blocked = currentUser?.blocked ?? [];

  const topFriends = useMemo(() => {
    const friendIds = new Set(friends.map((friend) => friend.id));

    return allUsers
      .filter(
        (user) =>
          friendIds.has(user.id) && !user.isPointsPrivate && !user.isDeleted
      )
      .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
      .slice(0, 5);
  }, [allUsers, friends]);

  const handleAddFriend = async (user: RspUser) => {
    try {
      const self = getLoggedInUsername();

      if (!self || !user?.username) {
        setPopupMessage("Please sign in again.");
        return;
      }

      if (self.toLowerCase() === user.username.toLowerCase()) {
        setPopupMessage("You cannot send a friend request to yourself.");
        return;
      }

      await acceptOrCreateFriend(self, user.username);
      await loadCurrentUserFriends();

      setSearch("");
      setSearchedUser(null);
      setPopupMessage(`Friend request sent to ${user.username}.`);
    } catch (err) {
      console.error(err);
      setPopupMessage(
        err instanceof Error
          ? err.message
          : "Network error while sending friend request."
      );
    }
  };

  const acceptRequest = async (requestUser: UserMini) => {
    try {
      const self = getLoggedInUsername();

      if (!self) {
        setPopupMessage("Please sign in again.");
        return;
      }

      await acceptOrCreateFriend(self, requestUser.username);
      await loadCurrentUserFriends();

      setPopupMessage(`Friend request accepted from ${requestUser.username}.`);
    } catch (err) {
      console.error(err);
      setPopupMessage(
        err instanceof Error ? err.message : "Error accepting request."
      );
    }
  };

  const declineOrRemove = async (
    user: UserMini,
    action: "declined" | "removed"
  ) => {
    try {
      const self = getLoggedInUsername();

      if (!self) {
        setPopupMessage("Please sign in again.");
        return;
      }

      await rejectOrDeleteFriend(self, user.username);
      await loadCurrentUserFriends();

      setPopupMessage(`${user.username} was ${action}.`);
    } catch (err) {
      console.error(err);
      setPopupMessage(
        err instanceof Error
          ? err.message
          : `Error while ${
              action === "declined" ? "declining" : "removing"
            } user.`
      );
    }
  };

  const handleBlock = async (user: UserMini | RspUser) => {
    try {
      const self = getLoggedInUsername();

      if (!self) {
        setPopupMessage("Please sign in again.");
        return;
      }

      if (self.toLowerCase() === user.username.toLowerCase()) {
        setPopupMessage("You cannot block yourself.");
        return;
      }

      await blockUser(self, user.username);
      await loadCurrentUserFriends();

      setSearch("");
      setSearchedUser(null);
      setPopupMessage(`${user.username} was blocked.`);
    } catch (err) {
      console.error(err);
      setPopupMessage(
        err instanceof Error ? err.message : "Error while blocking user."
      );
    }
  };

  const handleUnblock = async (user: UserMini) => {
    try {
      const self = getLoggedInUsername();

      if (!self) {
        setPopupMessage("Please sign in again.");
        return;
      }

      await unblockUser(self, user.username);
      await loadCurrentUserFriends();

      setPopupMessage(`${user.username} was unblocked.`);
    } catch (err) {
      console.error(err);
      setPopupMessage(
        err instanceof Error ? err.message : "Error while unblocking user."
      );
    }
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden px-4 py-4 text-[#111827] sm:px-6 lg:px-8">
      <NavBarComponent />

      <header className="mx-auto mb-6 w-full max-w-7xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Friends
        </h1>

        <p className="mt-3 max-w-2xl text-base text-slate-700 sm:text-lg">
          Connect with friends, handle requests, block users, and compare points.
        </p>
      </header>

      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.7fr)_minmax(280px,0.7fr)]">
        <div className="min-w-0 rounded-2xl border border-[#efcba5] bg-white/70 p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-[#efcba5] bg-[#fff0dd] px-5 py-3 text-sm font-bold text-[#b94a10]"
            >
              <Users size={16} />
              Friends
            </button>
          </div>

          <div className="rounded-xl border border-[#f2ddc2] bg-[#fffaf4]/80 p-4 sm:p-5">
            <h2 className="text-xl font-extrabold">Add Friends</h2>

            <p className="mt-2 text-sm text-slate-700">
              Find friends by username.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
                <Search size={17} className="shrink-0 text-slate-500" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Username"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </div>

              <button
                type="button"
                disabled={!searchedUser}
                onClick={() => searchedUser && handleAddFriend(searchedUser)}
                className="w-full rounded-lg border border-[#ef8a55] px-5 py-3 text-sm font-bold text-[#ef3f05] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Add Friend
              </button>
            </div>

            {loading && (
              <p className="mt-3 text-sm text-slate-600">Searching...</p>
            )}

            {search.trim() && !loading && !searchedUser && (
              <p className="mt-3 text-sm text-slate-600">No user found.</p>
            )}

            {searchedUser && (
              <div className="mt-3 flex flex-col gap-3 rounded-lg bg-white/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-[#b94a10]">
                    Found: {searchedUser.username}
                  </p>

                  <p className="text-xs text-slate-500">
                    {searchedUser.isPointsPrivate
                      ? "Points private"
                      : `${searchedUser.points ?? 0} pts`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleBlock(searchedUser)}
                  className="flex items-center gap-2 text-sm font-bold text-red-600"
                >
                  <Ban size={15} />
                  Block
                </button>
              </div>
            )}
          </div>

          <UserListCard
            title="Incoming Requests"
            count={friendRequests.length}
            empty="No incoming requests."
          >
            {friendRequests.map((request) => (
              <UserRow key={request.id} user={request}>
                <button
                  type="button"
                  onClick={() => acceptRequest(request)}
                  className="rounded-lg border border-[#ef8a55] px-4 py-2 text-sm font-bold text-[#ef3f05]"
                >
                  Accept
                </button>

                <button
                  type="button"
                  onClick={() => declineOrRemove(request, "declined")}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold"
                >
                  Decline
                </button>
              </UserRow>
            ))}
          </UserListCard>

          <UserListCard
            title="Outgoing Requests"
            count={outgoingRequests.length}
            empty="No outgoing requests."
          >
            {outgoingRequests.map((request) => (
              <UserRow key={request.id} user={request}>
                <button
                  type="button"
                  onClick={() => declineOrRemove(request, "removed")}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold"
                >
                  Cancel
                </button>
              </UserRow>
            ))}
          </UserListCard>

          <div className="mt-4 rounded-xl border border-[#f2ddc2] bg-[#fffaf4]/80 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold">Friends</h2>

              <span className="shrink-0 text-sm text-slate-700">
                {friends.length} Friends
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {friends.length === 0 && (
                <p className="text-sm text-slate-600">No friends yet.</p>
              )}

              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex max-w-full items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => declineOrRemove(friend, "removed")}
                    className="h-3 w-3 shrink-0 rounded-full bg-red-500 hover:bg-red-600"
                    aria-label={`Remove ${friend.username}`}
                  />

                  <span className="min-w-0 truncate">{friend.username}</span>

                  <span className="shrink-0 text-xs text-slate-500">
                    {publicPoints(friend)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleBlock(friend)}
                    className="ml-1 shrink-0 text-red-600"
                    aria-label={`Block ${friend.username}`}
                  >
                    <Ban size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <UserListCard
            title="Blocked Users"
            count={blocked.length}
            empty="No blocked users."
          >
            {blocked.map((user) => (
              <UserRow key={user.id} user={user}>
                <button
                  type="button"
                  onClick={() => handleUnblock(user)}
                  className="rounded-lg border border-[#ef8a55] px-4 py-2 text-sm font-bold text-[#ef3f05]"
                >
                  Unblock
                </button>
              </UserRow>
            ))}
          </UserListCard>
        </div>

        <div className="min-w-0 rounded-2xl border border-[#efcba5] bg-white/70 p-4 shadow-sm sm:p-6">
          <p className="mb-6 text-sm font-bold text-[#b94a10]">Your Stats</p>

          {pageLoading ? (
            <p className="text-sm text-slate-600">Loading your stats...</p>
          ) : (
            <div className="space-y-8">
              <Stat
                icon={<Trophy size={24} />}
                label="Total points"
                value={`${currentUser?.points ?? 0} pts`}
                note={currentUser?.isPointsPrivate ? "Private" : "Public"}
              />

              <Stat
                icon={<Users size={24} />}
                label="Current Streak"
                value={
                  currentUser?.isStreakPrivate
                    ? "Private"
                    : `${currentUser?.streak ?? 0} days`
                }
                note=""
              />
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-2xl border border-[#efcba5] bg-white/70 p-4 shadow-sm sm:p-6 lg:col-span-2 xl:col-span-1">
          <p className="mb-6 text-sm font-bold text-[#ef3f05]">Top Friends</p>

          <div className="space-y-6">
            {topFriends.length === 0 && (
              <p className="text-sm text-slate-600">
                Add friends to build your leaderboard.
              </p>
            )}

            {topFriends.map((friend, index) => (
              <div
                key={friend.id}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-bold ${
                      index === 0
                        ? "bg-[#f2b23a]"
                        : index === 1
                          ? "bg-slate-300"
                          : "bg-[#e4912f]"
                    }`}
                  >
                    {index + 1}
                  </span>

                  <span className="min-w-0 truncate font-semibold">
                    {friend.username}
                  </span>
                </div>

                <span className="shrink-0 font-semibold">
                  {friend.points ?? 0} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MessagePopup message={popupMessage} onClose={() => setPopupMessage("")} />
    </main>
  );
}

function UserListCard({
  title,
  count,
  empty,
  children,
}: {
  title: string;
  count: number;
  empty: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-4 rounded-xl border border-[#f2ddc2] bg-[#fffaf4]/80 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold leading-tight">{title}</h2>

        <span className="shrink-0 rounded-full bg-[#fff0dd] px-3 py-1 text-xs font-bold text-[#b94a10]">
          {count}
        </span>
      </div>

      <div className="space-y-3">
        {count === 0 ? (
          <p className="text-sm text-slate-600">{empty}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function UserRow({
  user,
  children,
}: {
  user: UserMini;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-white/80 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f0d7bd] font-bold">
          {user.username[0]?.toUpperCase()}
        </div>

        <div className="min-w-0">
          <p className="truncate font-semibold">{user.username}</p>
          <p className="text-xs text-slate-500">{publicPoints(user)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  note,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="flex items-center gap-4 sm:gap-5">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#fff0dd] text-[#d86b1f]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>

        <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
          <p className="break-words text-2xl font-extrabold sm:text-2xl">
            {value}
          </p>

          <span className="text-xs font-bold text-slate-700">{note}</span>
        </div>
      </div>
    </div>
  );
}