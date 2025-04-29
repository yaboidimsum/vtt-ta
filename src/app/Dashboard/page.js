"use client";

import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/provider/UserProvider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CircleHelpIcon } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Dashboard() {
  const { supervisor, tester, getTestResults } = useContext(UserContext);

  // Add loading state to handle initial render
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (!supervisor || !tester) {
      // Redirect to home if profile not set
      router.push("/");
    } else {
      // Data is loaded, we can safely access results
      setIsLoading(false);
    }
  }, [supervisor, tester, router]);

  // Only get results when not loading
  const l1Results = !isLoading ? getTestResults("L1") : null;
  const l2Results = !isLoading ? getTestResults("L2") : null;
  const l3Results = !isLoading ? getTestResults("L3") : null;

  // Check if all tests are completed
  const allTestsCompleted =
    l1Results?.completed && l2Results?.completed && l3Results?.completed;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-10">
      <h1 className="mb-8 text-3xl font-bold">Visual Turing Test Dashboard</h1>
      <div className="flex justify-items-center gap-2">
        <span className="text-zinc-500">Instruction</span>
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
                  2. Anda hanya akan diberikan satu pertanyaan: &quot;Apakah
                  gambar ini nyata?&quot;
                </li>
                <li>
                  3. Jawaban Anda akan selalu valid berdasarkan perspektif Anda.
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

      <div className="mb-10 grid w-full grid-cols-1 gap-6 px-10 md:grid-cols-3">
        <TestCard cellType="L1" results={l1Results} />
        <TestCard cellType="L2" results={l2Results} />
        <TestCard cellType="L3" results={l3Results} />
      </div>

      <div className="flex justify-end gap-4">
        <Link href={"/thankyou"}>
          <Button disabled={!allTestsCompleted}>
            {allTestsCompleted ? "Finish Task" : "Complete All Tests First"}
          </Button>
        </Link>
      </div>
    </div>
  );
}

function TestCard({ cellType, results }) {
  const progress = results ? results.progressPercentage : 0;
  const completed = results?.completed || false;
  const answeredQuestions = results?.answeredQuestions || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cellType} Cell Test</CardTitle>
        <CardDescription>
          {completed
            ? "Test completed"
            : answeredQuestions > 0
            ? `${answeredQuestions}/20 questions answered`
            : "Not started"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="mb-2" />
        {/* {completed && results && (
          <div className="mt-4">
            <p>Accuracy: {results.accuracy?.toFixed(1) || 0}%</p>
            <p>
              Correct answers: {results.correctAnswers || 0}/
              {results.answeredQuestions || 0}
            </p>
          </div>
        )} */}
      </CardContent>
      <CardFooter>
        {completed ? (
          <div className="flex w-full items-center justify-center rounded-md bg-green-300 p-2 font-semibold text-green-900">
            <h2>Completed</h2>
          </div>
        ) : answeredQuestions > 0 ? (
          <Link href={`/dashboard/${cellType}`} className="w-full">
            <Button
              variant={completed ? "outline" : "default"}
              className="w-full"
            >
              {" "}
              Continue Test
            </Button>
          </Link>
        ) : (
          <Link href={`/dashboard/${cellType}`} className="w-full">
            <Button
              variant={completed ? "outline" : "default"}
              className="w-full"
            >
              {" "}
              Start
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
