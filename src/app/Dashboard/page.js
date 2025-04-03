import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

import { CircleHelpIcon } from "lucide-react";

const Page = () => {
  const boxClassName = `flex items-center justify-center rounded-3xl px-10 py-10 text-9xl outline-2 outline-zinc-900 transition ease-in-out hover:bg-zinc-900 hover:text-zinc-100`;

  return (
    <main className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-16">
        <div className="flex gap-4">
          <h2 className="font-medium text-zinc-500">Choose your task</h2>
          <Dialog>
            <DialogTrigger>
              <CircleHelpIcon
                size={24}
                className="cursor-pointer text-zinc-500 transition ease-in-out hover:text-zinc-900"
              />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Guidance</DialogTitle>
                <DialogDescription>
                  Panduan ini akan memandu Anda tentang cara menjawab
                  pertanyaan-pertanyaan yang akan dikerjakan.
                </DialogDescription>
              </DialogHeader>
              <div>
                <ol className="[&>li]:pb-2.5">
                  <li>
                    1. Gambar semua sel (L1, L2, L3) akan ditampilkan kepada
                    penguji dengan resolusi 256 x 256.
                  </li>
                  <li>
                    2. Anda hanya akan diberikan satu pertanyaan: &quot;Apakah
                    gambar ini nyata?&quot;
                  </li>
                  <li>
                    3. Jawaban Anda akan selalu valid berdasarkan perspektif
                    Anda.
                  </li>
                  <li>
                    4. Setiap kelas (L1, L2, L3) akan memiliki 20 pertanyaan,
                    sehingga total ada 60 pertanyaan.
                  </li>
                  <li>
                    5. Tidak ada batasan waktu untuk menjawab, jadi silakan
                    luangkan waktu Anda!
                  </li>
                  <li>
                    6. Seorang pengawas akan tersedia untuk membimbing Anda jika
                    Anda memiliki pertanyaan atau kebingungan.
                  </li>
                </ol>
              </div>
              <DialogClose>
                <div className="cursor-pointer rounded-md bg-zinc-900 p-2 text-white">
                  <h2>I understand</h2>
                </div>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex gap-20">
          <Link href={`/dashboard/L1`}>
            <div className={boxClassName}>L1</div>
          </Link>
          <Link href={`/dashboard/L2`}>
            <div className={boxClassName}>L2</div>
          </Link>
          <Link href={`/dashboard/L3`}>
            <div className={boxClassName}>L3</div>
          </Link>
        </div>
        <Button disabled className={`cursor-pointer`}>
          Finish Task
        </Button>
      </div>
    </main>
  );
};

export default Page;
