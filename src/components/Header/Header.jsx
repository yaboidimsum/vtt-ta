import React from "react";

function Header() {
  return (
    <header className="sticky top-0 flex items-center justify-center gap-14 bg-zinc-900 p-4 text-zinc-300">
      <div className="flex gap-2 text-base">
        <h2 className="font-bold">Superviser:</h2>
        <span>Dimas Prihady Setyawan</span>
      </div>
      <div className="flex gap-2 text-base">
        <h2 className="font-bold">Current Tester:</h2>
        <span>Prof Radji</span>
      </div>
    </header>
  );
}

export default Header;
