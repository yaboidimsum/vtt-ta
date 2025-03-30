import React from "react";
import { Button } from "@/components/ui/button";
import { Home, FileDown } from "lucide-react";

const Page = () => {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-16 outline-2 outline-red-400">
      <div className="flex flex-col items-center justify-center gap-6">
        <h2 className="text-6xl font-medium">
          Thank You for Your Participation
        </h2>
        <p>
          Prof Radji, I hope our path cross again sometimes in the near future!
        </p>
      </div>
      <div>
        <div className="flex gap-8">
          <Button variant="ghost" className={`cursor-pointer`}>
            <Home />
            Home
          </Button>
          <Button className={`cursor-pointer`}>
            <FileDown />
            Download Report
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Page;
