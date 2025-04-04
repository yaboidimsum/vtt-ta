"use client";

import React from "react";
import { useContext } from "react";
import { UserContext } from "@/provider/UserProvider";
import { Button } from "../ui/button";
import Link from "next/link";
import { Rocket } from "lucide-react";

function StartProfile() {
  const { supervisor, tester, institution, faculty, department, speciality } =
    useContext(UserContext);

  return (
    <>
      {!supervisor ||
      !tester ||
      !institution ||
      !faculty ||
      !department ||
      !speciality ? (
        <Button disabled>
          <Rocket /> Start
        </Button>
      ) : (
        <Link
          href={`/dashboard`}
          className="flex items-center justify-center gap-2"
        >
          <Button
            disabled={
              !supervisor ||
              !tester ||
              !institution ||
              !faculty ||
              !department ||
              !speciality
            }
            className={`cursor-pointer`}
          >
            <Rocket />
            Start
          </Button>
        </Link>
      )}
    </>
  );
}

export default StartProfile;
