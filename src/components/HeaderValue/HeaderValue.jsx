"use client";

import { useContext } from "react";
import { UserContext } from "@/provider/UserProvider";

function HeaderValue() {
  const { supervisor, tester } = useContext(UserContext);

  return (
    <>
      <div className="flex gap-2 text-base">
        <h2 className="font-bold">Supervisor:</h2>
        <span>{supervisor}</span>
      </div>
      <div className="flex gap-2 text-base">
        <h2 className="font-bold">Current Tester:</h2>
        <span>{tester}</span>
      </div>
    </>
  );
}

export default HeaderValue;
