"use client";

import NavBarComponent from "@/components/nav";

type DailyItem = {
  name: string;
  hours: string;
};

export default function SchedulePage() {
  const todayTitle = "Today";
  const todayPlan = "Nothing Planned";

  const nextWeekTitle = "Next Week";
  const nextWeekPlan = "Jan 2nd Date Night";

  const dailySchedule: DailyItem[] = [
    { name: "Free Time", hours: "6 hours" },
    { name: "Study", hours: "6 hours" },
    { name: "Gym", hours: "6 hours" },
    { name: "New Skill", hours: "6 hours" },
    { name: "Chores", hours: "6 hours" },
  ];

  return (
    <main className="min-h-screen w-full bg-[url('/Assets/Background.png')] bg-cover bg-center bg-no-repeat px-4 py-4 lg:px-6">
      <div className="w-full">
        <NavBarComponent/>

        {/* title */}
        <div className="mb-4 flex h-[70px] w-full items-center justify-center bg-[url('/Assets/Title.png')] bg-cover bg-center bg-no-repeat">
          <h1 className="font-large text-center text-[2.4rem] text-black">
            Plan the Future to Know Your Future
          </h1>
        </div>

        {/* content */}
        <section className="grid w-full grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.35fr]">
          {/* left card */}
          <div className="h-[560px] rounded-[28px] bg-[url('/Assets/Card.png')] bg-cover bg-center bg-no-repeat p-6 shadow-md overflow-hidden">
            <h2 className="font-small mb-8 text-center text-[2rem] text-black">
              Daily Schedule
            </h2>

            <div className="flex h-[calc(100%-5rem)] flex-col">
              <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                {dailySchedule.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-[1.6rem] leading-none text-white"
                      >
                        ×
                      </button>

                      <span className="font-small text-[1.7rem] text-black">
                        {item.name}
                      </span>
                    </div>

                    <span className="font-small text-[1.4rem] text-black">
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-4">
                <span className="font-small text-[1.5rem] text-black">
                  Add Daily?
                </span>

                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center bg-[#d9d9d9] text-[2rem] leading-none text-black shadow"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* right side */}
          <div className="flex flex-col gap-4">
            <div className="h-[460px] rounded-[28px] bg-[url('/Assets/Card.png')] bg-cover bg-center bg-no-repeat p-8 shadow-md overflow-hidden">
              <div className="flex h-full flex-col items-center justify-center text-center">
                <h2 className="font-small text-[3.2rem] text-black">
                  {todayTitle}
                </h2>

                <p className="font-small mt-2 text-[2.2rem] text-black">
                  {todayPlan}
                </p>

                <h2 className="font-small mt-14 text-[3.2rem] text-black">
                  {nextWeekTitle}
                </h2>

                <p className="font-small mt-2 text-[2.2rem] text-black">
                  {nextWeekPlan}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                className="font-small min-w-[260px] rounded-[20px] bg-[url('/Assets/Card.png')] bg-cover bg-center bg-no-repeat px-10 py-5 text-[2rem] text-black shadow-md"
              >
                Add Event ?
              </button>
            </div>
          </div>
        </section>

        {/* logout */}
        <div className="mt-4">
          <button className="font-small rounded-xl border border-[#9b7b56] bg-[#f4ead8] px-6 py-2 text-[1.4rem] text-black shadow">
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}