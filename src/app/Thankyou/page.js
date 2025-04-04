import React from "react";
import ParticipantName from "@/components/ParticipantName";
import DialogThankyou from "@/components/DialogThankyou";

const Page = () => {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-16 outline-2 outline-red-400">
      <div className="flex flex-col items-center justify-center gap-6">
        <h2 className="text-6xl font-medium">
          Thank You for Your Participation, <ParticipantName />
        </h2>
        <p>
          <ParticipantName />, I hope our path cross again sometimes in the near
          future!
        </p>
      </div>
      <div>
        <DialogThankyou />
      </div>
    </main>
  );
};

export default Page;
