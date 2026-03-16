import Link from "next/link";

const NavBarComponent = () => {
  return (


<div className="mb-3 flex w-full justify-end gap-3">

  <Link
    href="/home"
    className="font-small rounded-xl border border-[#9b7b56] bg-[#f4ead8] px-6 py-2 text-[1.5rem] text-black shadow hover:bg-[#eadbc3]"
  >
    Home
  </Link>

  <Link
    href="/schedule"
    className="font-small rounded-xl border border-[#9b7b56] bg-[#f4ead8] px-6 py-2 text-[1.5rem] text-black shadow hover:bg-[#eadbc3]"
  >
    Schedule
  </Link>

  <Link
    href="/"
    className="font-small rounded-xl border border-[#9b7b56] bg-[#f4ead8] px-6 py-2 text-[1.5rem] text-black shadow hover:bg-[#eadbc3]"
  >
    Login for now
  </Link>

</div>
  )
}

export default NavBarComponent