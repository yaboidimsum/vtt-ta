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
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const {
    supervisor,
    tester,
    getTestResults,
  } = useContext(UserContext);

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

  // const handleExport = () => {
  //   if (isLoading) return;

  //   const results = exportAllResults();
  //   const dataStr =
  //     "data:text/json;charset=utf-8," +
  //     encodeURIComponent(JSON.stringify(results, null, 2));
  //   const downloadAnchorNode = document.createElement("a");
  //   downloadAnchorNode.setAttribute("href", dataStr);
  //   downloadAnchorNode.setAttribute(
  //     "download",
  //     `vtt_results_${tester.replace(/\s+/g, "_")}.json`
  //   );
  //   document.body.appendChild(downloadAnchorNode);
  //   downloadAnchorNode.click();
  //   downloadAnchorNode.remove();
  // };

  // // Handle reset and redirect to landing page
  // const handleReset = () => {
  //   if (isLoading) return;

  //   // Reset all test data
  //   resetAllTestData();

  //   // Redirect to landing page
  //   router.push("/");
  // };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-10 outline-2 outline-red-500">
      <h1 className="mb-8 text-3xl font-bold">Visual Turing Test Dashboard</h1>

      <div className="mb-10 grid w-full grid-cols-1 gap-6 px-10 md:grid-cols-3">
        <TestCard cellType="L1" results={l1Results} />
        <TestCard cellType="L2" results={l2Results} />
        <TestCard cellType="L3" results={l3Results} />
      </div>

      <div className="flex justify-end gap-4">
        {/* <Button onClick={handleExport}>Export Results</Button>
        <Button onClick={handleReset} variant="destructive">
          Reset All Data
        </Button> */}
        <Link href={"/thankyou"}>
          <Button>Finish Task</Button>
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
