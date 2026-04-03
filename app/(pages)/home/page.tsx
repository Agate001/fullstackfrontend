"use client";

import NavBarComponent from "@/components/nav";
import Link from "next/link";



type TaskItem = {
  name: string;
  percent: number;
  color?: string;
};

export default function HomePage() {
  const score = 75;
  const currentTime = "1:34:34";
  const targetTime = "2:00:00";

  const workingOn: TaskItem[] = [
    { name: "Free Time", percent: 125, color: "text-red-500" },
    { name: "Study", percent: 125, color: "text-lime-600" },
    { name: "Chores", percent: 125, color: "text-lime-600" },
    { name: "Gym", percent: 125, color: "text-lime-600" },
    { name: "New Skill", percent: 125, color: "text-lime-600" },
  ];

  const completed: TaskItem[] = [
    { name: "Gym", percent: 125, color: "text-lime-600" },
  ];

  const progress = 100;
  const bonus = 25;

  return (
    <main className="min-h-screen w-full bg-[url(/Assets/Background.png)] bg-cover bg-center bg-no-repeat px-4 py-4 lg:px-6">
      <div className="w-full">
          <NavBarComponent/>

        {/* title */}
        <div className="mb-3 flex h-17.5 w-full items-center justify-center bg-[url(/Assets/Title.png)] bg-cover bg-center bg-no-repeat">
          <h1 className="font-large text-center text-[2.4rem] text-black">
            Make Today Your Tomorrow
          </h1>
        </div>

        {/* layout */}
        <section className="grid w-full grid-cols-1 gap-3 xl:grid-cols-[1.35fr_1.1fr_0.8fr]">
          {/* left */}
          <div className="h-140 rounded-[28px] bg-[url(/Assets/Card.png)] bg-cover bg-center bg-no-repeat p-6 shadow-md overflow-hidden">
            <h2 className="font-small mb-6 text-center text-[2.1rem] text-black">
              What Are We Working On
            </h2>

            <div className="h-[calc(100%-4rem)] space-y-6 overflow-y-auto px-6 pr-3">
              {workingOn.map((item) => (
                <div
                  key={item.name}
                  className="font-small flex items-center justify-between text-[1.8rem]"
                >
                  <span
                    className={
                      item.name === "New Skill" ? "text-blue-500" : "text-black"
                    }
                  >
                    {item.name}
                  </span>

                  <span className={item.color}>{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* middle */}
          <div className="flex flex-col gap-3">
            {/* score */}
            <div className="min-h-45 rounded-[28px] bg-[url('/Assets/Card.png')] bg-cover bg-center bg-no-repeat p-5 shadow-md overflow-hidden">
              <div className="grid h-full grid-cols-2 gap-6">
                <div>
                  <p className="font-small text-[1.9rem] text-black">Score</p>
                  <p className="font-small mt-3 text-[2.4rem] text-black">
                    +{score} Pts
                  </p>
                </div>

                <div>
                  <p className="font-small text-center text-[1.8rem] text-black">
                    New Skill
                  </p>

                  <div className="font-small mt-2 flex justify-between text-[1.4rem] text-black">
                    <span>{progress}%</span>
                    <span>progress</span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-4 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-lime-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <span className="font-small text-[1.7rem] text-black">
                      +{bonus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* timer */}
            <div className="min-h-[180px] rounded-[28px] bg-[url('/Assets/Card.png')] bg-cover bg-center bg-no-repeat p-5 shadow-md overflow-hidden">
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="font-small mb-4 text-[2.2rem] text-black">
                  {currentTime} / {targetTime}
                </p>

                <button className="font-small rounded-2xl bg-red-600 px-10 py-2 text-[2rem] text-black shadow">
                  Stop
                </button>
              </div>
            </div>

            {/* add */}
            <button className="min-h-[180px] rounded-[28px] bg-[url('/Assets/Card.png')] bg-cover bg-center bg-no-repeat shadow-md overflow-hidden flex items-center justify-center">
              <span className="font-large text-[5rem] leading-none text-black">
                +
              </span>
            </button>
          </div>

          {/* right */}
          <div className="h-[560px] rounded-[28px] bg-[url('/Assets/Card.png')] bg-cover bg-center bg-no-repeat p-6 shadow-md overflow-hidden">
            <h2 className="font-small mb-6 text-center text-[2.1rem] text-black">
              Completed
            </h2>

            <div className="h-[calc(100%-4rem)] space-y-6 overflow-y-auto px-2 pr-3">
              {completed.map((item) => (
                <div
                  key={item.name}
                  className="font-small flex items-center justify-between text-[1.8rem] text-black"
                >
                  <span>{item.name}</span>
                  <span className={item.color}>{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* logout */}
        <div className="mt-3">
          <Link className="font-small rounded-xl border border-[#9b7b56] bg-[#f4ead8] px-6 py-2 text-[1.4rem] text-black shadow"
          href="/">
            Logout
          </Link>
        </div>
      </div>
    </main>
  );
}