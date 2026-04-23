"use client";

import NavBarComponent from "@/components/nav";
import Link from "next/link";
import { useState } from "react";

const globalLeaders = Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1,
  player: "",
  points: "",
}));

const friendLeaders = Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1,
  player: "",
  points: "",
}));


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
  return (
    <main className="min-h-screen w-full bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Background.png)] bg-cover bg-center bg-no-repeat px-4 py-4 lg:px-6">
      <div className="w-full">
        <NavBarComponent />

        {/* title */}
        <div className="relative mb-6 flex h-27.5 w-full items-center justify-center bg-[url(https://csablobcarlos.blob.core.windows.net/clmbloblect/Title.png)] bg-cover bg-center bg-no-repeat px-6">

          <h1 className="font-large text-center text-[2.2rem] leading-tight text-black">
            Where Do You Stand Against
            <br />
            Your Competition
          </h1>

          {/* add friend button */}
          <button className="absolute right-6 top-1/2 -translate-y-1/2 w-20">
            <img src="/assets/addfriendbtn.png" alt="add friends btn" />
          </button>

        </div>

        {/* centered leaderboards */}
        <section className="flex flex-wrap items-center justify-center gap-10">
          <LeaderBoardCard
            title="Global Leader Board"
            data={globalLeaders}
          />

          <LeaderBoardCard
            title="Friend Leader Board"
            data={friendLeaders}
          />
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

        {/* logout */}
        <div className="mt-6">
          <Link className="font-small rounded-xl border border-[#9b7b56] bg-[#f4ead8] px-6 py-2 text-[1.4rem] text-black shadow"
            href="/">
            Logout
          </Link>
        </div>
      </div>
    </main>
  );
}