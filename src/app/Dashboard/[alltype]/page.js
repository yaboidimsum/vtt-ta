import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

import { CircleHelpIcon, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Image from "next/image";

async function Page({ params }) {
  const { alltype } = await params;
  const counter = 20;

  const divStyle = `flex flex-col items-center justify-center gap-2 text-lg text-zinc-500`;

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-10 ">
      <div className="flex w-full items-center justify-around outline-2 outline-red-400">
        <div className={`${divStyle} flex-1`}>
          <span>Current Task</span>
          <Badge
            className={`rounded-full px-3 py-1 text-xl font-medium`}
            variant="outline"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="11"
              viewBox="0 0 10 11"
              fill="none"
            >
              <circle cx="5" cy="5.5" r="5" fill="#4ADE80" />
            </svg>
            <h2>{alltype} ALL Class</h2>
          </Badge>
        </div>
        <div className={`${divStyle} flex-1`}>
          <span>Question</span>
          <span>1/20</span>
          <Progress value={100} className="w-[30%]" />
        </div>
        <div className={`${divStyle} flex-1 flex-row`}>
          <span>Instruction</span>
          <Dialog>
            <DialogTrigger>
              <CircleHelpIcon
                size={20}
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
                    2. Anda hanya akan diberikan satu pertanyaan: "Apakah gambar
                    ini nyata?"
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
      </div>
      {counter === 20 ? (
        <div className="grid w-[50%] gap-1.5 px-10">
          <Label htmlFor="message" className={`text-lg`}>
            Berdasarkan 20 pertanyaan yang telah Anda jawab, Apa pendapat Anda
            mengenai kualitas asli dan palsu dari sel L1?
          </Label>
          <div className="flex w-full flex-col gap-12">
            <Textarea
              className={`h-16`}
              placeholder="Type your message here."
              id="message"
            />
            <Button disabled>Submit</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          <div className="rounded-lg outline-2 outline-red-400">
            <Image
              className="rounded-lg object-fill"
              alt="example cell"
              src={"/L1_dt_1.jpg"}
              width={512}
              height={512}
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-10">
            <span className="text-2xl">Is this cell image real or fake?</span>
            <div className="flex w-full justify-between">
              <Button className={`cursor-pointer bg-red-500 hover:bg-red-600`}>
                <X />
                Fake
              </Button>
              <Button
                className={`cursor-pointer bg-green-500 hover:bg-green-600`}
              >
                <Check />
                Real
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Page;
