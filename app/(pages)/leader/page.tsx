"use client";

import NavBarComponent from "@/components/nav";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    <div className="w-full max-w-105 rounded-[28px] bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Card.png)] bg-cover bg-center bg-no-repeat p-5 shadow-lg">
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
  const [searchedUser, setSearchedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [friendRequests, setFriendRequests] = useState([
    { id: 1, name: "Bob" },
    { id: 2, name: "Dan" },
  ]);

  const [friends, setFriends] = useState<any[]>([]);

  const myScore = {
    rank: 11,
    player: "You",
    points: "9900",
  };

  useEffect(() => {
    if (!search) {
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
        `https://csa-2526-studysync-api-b6bue3aue8hka0ea.westus3-01.azurewebsites.net/api/User/Verbose/GetOneByUsername/${search.trim()}`
      );

      if (!res.ok) {
        setSearchedUser(null);
        return;
      }

      const data = await res.json();
      setSearchedUser(data);
    } catch (err) {
      console.error(err);
      setSearchedUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FRIEND REQUEST (WITH STATUS ALERTS)
  const handleAddFriend = async (user: any) => {
  try {
    const self = localStorage.getItem("username");

    if (!self || !user?.username) {
      alert("Missing username or target user");
      return;
    }

    const url = `https://csa-2526-studysync-api-b6bue3aue8hka0ea.westus3-01.azurewebsites.net/api/Friend/AcceptOrCreate/${self}/${user.username}`;

    const res = await fetch(url, {
      method: "POST",
    });

    // 🔥 NEW: show real backend error
    if (!res.ok) {
      const text = await res.text(); // backend message (IMPORTANT)
      console.log("Backend error:", text);
      alert(`❌ FAILED: ${text}`);
      return;
    }

    alert(`✅ Friend request SENT to ${user.username}`);
  } catch (err) {
    console.error("Frontend error:", err);
    alert("❌ Network/Fetch error");
  }
};

  // 🔥 ACCEPT REQUEST (WITH ALERT)
  const acceptRequest = async (id: number, name: string) => {
    try {
      const self = localStorage.getItem("username");

      const url = `https://csa-2526-studysync-api-b6bue3aue8hka0ea.westus3-01.azurewebsites.net/api/Friend/AcceptOrCreate/${self}/${name}`;

      const res = await fetch(url, { method: "POST" });

      if (!res.ok) {
        alert("❌ Accept failed");
        return;
      }

      setFriends((prev) => [...prev, { id, name }]);
      setFriendRequests((prev) => prev.filter((r) => r.id !== id));

      alert(`✅ Friend request ACCEPTED from ${name}`);
    } catch (err) {
      console.error(err);
      alert("❌ Error accepting request");
    }
  };

  // 🔥 REJECT REQUEST (WITH ALERT)
  const declineRequest = async (id: number, name: string) => {
    try {
      const self = localStorage.getItem("username");

      const url = `https://csa-2526-studysync-api-b6bue3aue8hka0ea.westus3-01.azurewebsites.net/api/Friend/RejectOrDelete/${self}/${name}`;

      const res = await fetch(url, { method: "POST" });

      if (!res.ok) {
        alert("❌ Reject failed");
        return;
      }

      setFriendRequests((prev) => prev.filter((r) => r.id !== id));

      alert(`❌ Friend request REJECTED from ${name}`);
    } catch (err) {
      console.error(err);
      alert("❌ Error rejecting request");
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
            onClick={() => setShowAddFriend(true)}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-20"
          >
            <img src="/assets/addfriendbtn.png" alt="add friends btn" />
          </button>
        </div>

        <section className="flex flex-wrap items-center justify-center gap-10">
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

          <LeaderBoardCard title="Friend Leader Board" data={friendLeaders} />
        </section>

        <button
          onClick={() => setOnline(!online)}
          className="absolute bottom-1 left-180 -translate-x-1/2 w-16"
        >
          <img
            src={online ? "/assets/Onlinebtn.png" : "/assets/Offlinebtn.png"}
            alt="online toggle button"
          />
        </button>

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
          <div className="relative w-[420px] rounded-2xl bg-[#f5e9d6] shadow-xl p-6 text-black">

            <button
              onClick={() => setShowAddFriend(false)}
              className="absolute right-3 top-3 text-xl"
            >
              ✕
            </button>

            <h2 className="text-center text-2xl font-semibold mb-4">
              Add a Friend
            </h2>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full mt-1 mb-3 p-2 rounded-md border border-gray-400"
              placeholder="Enter username..."
            />

            {loading && <p>Searching...</p>}

            {searchedUser && (
              <div className="bg-white border rounded-md p-3 mb-3">
                <p className="font-semibold">{searchedUser.username}</p>
                <button
                  onClick={() => handleAddFriend(searchedUser)}
                  className="text-green-600 mt-2"
                >
                  + Send Friend Request
                </button>
              </div>
            )}

            <div className="bg-white rounded-lg p-3 border border-gray-300 mb-3">
              <p className="text-sm font-medium mb-2">Requests:</p>

              {friendRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between py-1 border-b"
                >
                  <span>{req.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRequest(req.id, req.name)}
                      className="text-green-600 text-lg"
                    >
                      ✔
                    </button>
                    <button
                      onClick={() => declineRequest(req.id, req.name)}
                      className="text-red-600 text-lg"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {friends.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-gray-300">
                <p className="text-sm font-medium mb-2">Friends:</p>

                {friends.map((f) => (
                  <div key={f.id} className="py-1 border-b last:border-b-0">
                    {f.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}