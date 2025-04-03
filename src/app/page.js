import React from "react";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import Link from "next/link";
import DialogSign from "@/components/DialogSign";

const Page = () => {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-16 outline-2 outline-red-400">
      <div className="flex flex-col items-center justify-center gap-6">
        <h2 className="text-6xl font-semibold">
          Welcome to Dimas&apos;s Thesis VTT Research
        </h2>
        <p>Your contribution will help him finish his thesis!</p>
      </div>
      <div>
        <div className="flex gap-8">
          <Link href={`/dashboard`}>
            <Button className={`cursor-pointer`}>
              <Rocket />
              Start
            </Button>
          </Link>
          <DialogSign />
        </div>
      </div>
    </main>
  );
};

export default Page;
