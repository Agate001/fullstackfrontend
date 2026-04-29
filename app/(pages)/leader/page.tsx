"use client";

import NavBarComponent from "@/components/nav";
import Link from "next/link";
import { useEffect, useState } from "react";
import MessagePopup from "@/components/MessagePopUp";

type UserMini = {
  id: number;
  username: string;
};

type VerboseUser = {
  id: number;
  username: string;
  outgoingRequests: UserMini[];
  incomingRequests: UserMini[];
  friends: UserMini[];
};

const API_BASE =
  "https://csa-2526-studysync-api-b6bue3aue8hka0ea.westus3-01.azurewebsites.net/api/";

const getLoggedInUsername = () => {
  const username = localStorage.getItem("username");
  if (username) return username;

  const user = localStorage.getItem("user");
  if (!user) return null;

  try {
    const parsedUser = JSON.parse(user);
    return parsedUser.username || null;
  } catch {
    return user;
  }
};

const globalLeaders = Array.from({ length: 10 }, (_, i) => {
  const names = [
    "Alex Johnson",
    "Sophia Lee",
    "Ethan Smith",
    "Olivia Brown",
    "Liam Davis",
    "Ava Wilson",
    "Noah Martinez",
    "Isabella Garcia",
    "James Anderson",
    "Mia Thomas",
  ];

  const scores = [9850, 9720, 9605, 9480, 9350, 9210, 9100, 8995, 8850, 8700];

  return {
    rank: i + 1,
    player: names[i],
    points: scores[i].toString(),
  };
});

const friendLeaders = Array.from({ length: 10 }, (_, i) => {
  const names = [
    "You",
    "Jordan",
    "Chris",
    "Taylor",
    "Morgan",
    "Casey",
    "Riley",
    "Avery",
    "Parker",
    "Quinn",
  ];

  const scores = [9900, 9400, 9150, 9000, 8900, 8750, 8600, 8450, 8300, 8150];

  return {
    rank: i + 1,
    player: names[i],
    points: scores[i].toString(),
  };
});

function LeaderBoardCard({
  title,
  data,
}: {
  title: string;
  data: { rank: number; player: string; points: string }[];
}) {
  return (
    <div className="w-full max-w-[700px] rounded-[28px] bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Card.png)] bg-cover bg-center bg-no-repeat p-5 shadow-lg">
      <h2 className="font-small mb-5 text-center text-[1.8rem] text-black underline">
        {title}
      </h2>

      <table className="w-full border border-gray-400 text-black">
        <thead>
          <tr className="border-b border-gray-400">
            <th className="w-14 border-r p-2 text-left">#</th>
            <th className="border-r p-2 text-left">Player</th>
            <th className="p-2 text-left">Points</th>
          </tr>
        </thead>

        <tbody>
          {data.map((player) => (
            <tr key={player.rank} className="border-b border-gray-300">
              <td className="border-r p-2">{player.rank}</td>
              <td className="border-r p-2">{player.player}</td>
              <td className="p-2">{player.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function HomePage() {
  const [online, setOnline] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);

  const [search, setSearch] = useState("");
  const [searchedUser, setSearchedUser] = useState<VerboseUser | null>(null);
  const [loading, setLoading] = useState(false);

  const [friendRequests, setFriendRequests] = useState<UserMini[]>([]);
  const [friends, setFriends] = useState<UserMini[]>([]);
  const [popupMessage, setPopupMessage] = useState("");

  const myScore = {
    rank: 11,
    player: "You",
    points: "9900",
  };

  const loadCurrentUserFriends = async () => {
    try {
      const self = getLoggedInUsername();

      if (!self) {
        console.log("Missing logged in username");
        return;
      }

      const res = await fetch(
        `${API_BASE}User/Verbose/GetOneByUsername/${self}`
      );

      if (!res.ok) {
        console.error(await res.text());
        return;
      }

      const data: VerboseUser = await res.json();

      setFriendRequests(data.incomingRequests || []);
      setFriends(data.friends || []);
    } catch (err) {
      console.error("Failed to load friends:", err);
      setPopupMessage("Failed to load friends.");
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

    const timeout = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

  const handleSearch = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE}User/Verbose/GetOneByUsername/${search.trim()}`
      );

      if (!res.ok) {
        setSearchedUser(null);
        return;
      }

      const data: VerboseUser = await res.json();
      setSearchedUser(data);
    } catch (err) {
      console.error(err);
      setSearchedUser(null);
      setPopupMessage("Could not search for that user.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (user: VerboseUser) => {
    try {
      const self = getLoggedInUsername();

      if (!self || !user?.username) {
        setPopupMessage("Missing username or target user.");
        return;
      }

      if (self === user.username) {
        setPopupMessage("You cannot send a friend request to yourself.");
        return;
      }

      const url = `${API_BASE}Friend/AcceptOrCreate/${self}/${user.username}`;

      const res = await fetch(url, {
        method: "POST",
      });

      if (!res.ok) {
        const text = await res.text();
        setPopupMessage(`Failed: ${text}`);
        return;
      }

      await loadCurrentUserFriends();

      setPopupMessage(`Friend request sent to ${user.username}.`);
    } catch (err) {
      console.error("Frontend error:", err);
      setPopupMessage("Network error while sending friend request.");
    }
  };

  const acceptRequest = async (requestUser: UserMini) => {
    try {
      const self = getLoggedInUsername();

      if (!self) {
        setPopupMessage("Missing logged in username.");
        return;
      }

      const url = `${API_BASE}Friend/AcceptOrCreate/${self}/${requestUser.username}`;

      const res = await fetch(url, {
        method: "POST",
      });

      if (!res.ok) {
        setPopupMessage(`Accept failed: ${await res.text()}`);
        return;
      }

      await loadCurrentUserFriends();

      setPopupMessage(`Friend request accepted from ${requestUser.username}.`);
    } catch (err) {
      console.error(err);
      setPopupMessage("Error accepting request.");
    }
  };

  const declineRequest = async (requestUser: UserMini) => {
    try {
      const self = getLoggedInUsername();

      if (!self) {
        setPopupMessage("Missing logged in username.");
        return;
      }

      const url = `${API_BASE}Friend/RejectOrDelete/${self}/${requestUser.username}`;

      const res = await fetch(url, {
        method: "POST",
      });

      if (!res.ok) {
        setPopupMessage(`Reject failed: ${await res.text()}`);
        return;
      }

      await loadCurrentUserFriends();

      setPopupMessage(`Friend request rejected from ${requestUser.username}.`);
    } catch (err) {
      console.error(err);
      setPopupMessage("Error rejecting request.");
    }
  };

  const removeFriend = async (friendUser: UserMini) => {
    try {
      const self = getLoggedInUsername();

      if (!self) {
        setPopupMessage("Missing logged in username.");
        return;
      }

      const url = `${API_BASE}Friend/RejectOrDelete/${self}/${friendUser.username}`;

      const res = await fetch(url, {
        method: "POST",
      });

      if (!res.ok) {
        setPopupMessage(`Remove failed: ${await res.text()}`);
        return;
      }

      await loadCurrentUserFriends();

      setPopupMessage(`${friendUser.username} was removed.`);
    } catch (err) {
      console.error(err);
      setPopupMessage("Error removing friend.");
    }
  };

  return (
    <main className="min-h-screen w-full bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Background.png)] bg-cover bg-center bg-no-repeat px-4 py-4 lg:px-6">
      <div className="w-full">
        <NavBarComponent />

        <div className="relative mb-6 flex h-27.5 w-full items-center justify-center bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Title.png)] bg-cover bg-center bg-no-repeat px-6">
          <h1 className="font-large text-center text-[2.2rem] leading-tight text-black">
            Where Do You Stand Against
            <br />
            Your Competition
          </h1>

          <button
            onClick={() => {
              setShowAddFriend(true);
              loadCurrentUserFriends();
            }}
            className="absolute right-6 top-1/2 w-20 -translate-y-1/2"
          >
            <img src="/assets/addfriendbtn.png" alt="add friends btn" />
          </button>
        </div>

        <section className="flex flex-wrap items-center justify-center gap-10">
          <div className="relative">
            <LeaderBoardCard
              title="Global Leader Board"
              data={
                online
                  ? [...globalLeaders, myScore]
                    .sort((a, b) => Number(b.points) - Number(a.points))
                    .slice(0, 10)
                    .map((p, i) => ({ ...p, rank: i + 1 }))
                  : globalLeaders
              }
            />

            <button
              onClick={() => setOnline(!online)}
              className="absolute -bottom-3 -right-3 w-12"
            >
              <img
                src={online ? "/assets/Onlinebtn.png" : "/assets/Offlinebtn.png"}
                alt="online toggle button"
              />
            </button>
          </div>

          
          <div className="relative">
            <LeaderBoardCard title="Friend Leader Board" data={friendLeaders} />
          </div>
        </section>


        <div className="mt-6">
          <Link
            className="font-small rounded-xl border border-[#9b7b56] bg-[#f4ead8] px-6 py-2 text-[1.4rem] text-black shadow"
            href="/"
          >
            Logout
          </Link>
        </div>
      </div>

      {showAddFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-[420px] rounded-2xl bg-[#f5e9d6] p-6 text-black shadow-xl">
            <button
              onClick={() => setShowAddFriend(false)}
              className="absolute right-3 top-3 text-xl"
            >
              ✕
            </button>

            <h2 className="mb-4 text-center text-2xl font-semibold">
              Add a Friend
            </h2>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-3 mt-1 w-full rounded-md border border-gray-400 p-2"
              placeholder="Enter username..."
            />

            {loading && <p>Searching...</p>}

            {searchedUser && (
              <div className="mb-3 rounded-md border bg-white p-3">
                <p className="font-semibold">{searchedUser.username}</p>

                <button
                  onClick={() => handleAddFriend(searchedUser)}
                  className="mt-2 text-green-600"
                >
                  + Send Friend Request
                </button>
              </div>
            )}

            <div className="mb-3 rounded-lg border border-gray-300 bg-white p-3">
              <p className="mb-2 text-sm font-medium">Requests:</p>

              {friendRequests.length === 0 && (
                <p className="text-sm text-gray-500">No incoming requests</p>
              )}

              {friendRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between border-b py-1 last:border-b-0"
                >
                  <span>{req.username}</span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRequest(req)}
                      className="text-lg text-green-600"
                    >
                      ✔
                    </button>

                    <button
                      onClick={() => declineRequest(req)}
                      className="text-lg text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-gray-300 bg-white p-3">
              <p className="mb-2 text-sm font-medium">Friends:</p>

              {friends.length === 0 && (
                <p className="text-sm text-gray-500">No friends yet</p>
              )}

              {friends.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between border-b py-1 last:border-b-0"
                >
                  <span>{f.username}</span>

                  <button
                    onClick={() => removeFriend(f)}
                    className="text-lg text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <MessagePopup
        message={popupMessage}
        onClose={() => setPopupMessage("")}
      />
    </main>
  );
}