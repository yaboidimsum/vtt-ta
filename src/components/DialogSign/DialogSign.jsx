import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Rocket } from "lucide-react";
import StartProfile from "../StartProfile";
import DialogProfile from "../DialogProfile";

function DialogSign() {
  return (
    <>
      <StartProfile />
      <DialogProfile />
    </>
  );
}

export default DialogSign;
