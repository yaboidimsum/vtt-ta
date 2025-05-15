"use client"; // Add "use client" directive

import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "@/provider/UserProvider"; // Import UserContext
import { useRouter } from "next/navigation"; // Import useRouter
import ParticipantName from "@/components/ParticipantName";
import DialogThankyou from "@/components/DialogThankyou";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // For styling results

// Helper function to format time duration
const formatDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return "N/A";
  const durationMs = new Date(endTime) - new Date(startTime);
  const seconds = Math.floor((durationMs / 1000) % 60);
  const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
  const hours = Math.floor((durationMs / (1000 * 60 * 60)) % 24);
  
  let durationStr = "";
  if (hours > 0) durationStr += `${hours}h `;
  if (minutes > 0) durationStr += `${minutes}m `;
  if (seconds > 0 || (hours === 0 && minutes === 0)) durationStr += `${seconds}s`;
  
  return durationStr.trim() || "0s";
};

const Page = () => {
  const { supervisor, tester, exportAllResults } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [allResults, setAllResults] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Redirect if essential data is missing (user might have landed here directly)
    if (!supervisor || !tester) {
      router.push("/");
    } else {
      const results = exportAllResults();
      setAllResults(results);
      setIsLoading(false);
    }
  }, [supervisor, tester, exportAllResults, router]);

  if (isLoading) {
    return (
      <main className="flex h-screen flex-col items-center justify-center">
        <p>Loading results...</p>
      </main>
    );
  }

  if (!allResults) {
    return (
      <main className="flex h-screen flex-col items-center justify-center">
        <p>Could not load results. Please try again or contact support.</p>
      </main>
    );
  }

  const { testerInfo, results } = allResults;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 p-4 py-10 md:p-16">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-4xl font-medium md:text-6xl">
          Thank You for Your Participation, <ParticipantName />!
        </h2>
        <p className="text-lg">
          Here is a summary of your test results.
        </p>
      </div>

      {testerInfo && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Participant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><strong>Tester:</strong> {testerInfo.tester}</p>
            <p><strong>Supervisor:</strong> {testerInfo.supervisor}</p>
            <p><strong>Institution:</strong> {testerInfo.institution}</p>
            {testerInfo.faculty && <p><strong>Faculty:</strong> {testerInfo.faculty}</p>}
            {testerInfo.department && <p><strong>Department:</strong> {testerInfo.department}</p>}
            {testerInfo.speciality && <p><strong>Speciality:</strong> {testerInfo.speciality}</p>}
          </CardContent>
        </Card>
      )}

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        {["L1", "L2", "L3"].map((cellType) => {
          const testResult = results?.[cellType];
          if (!testResult) {
            return (
              <Card key={cellType}>
                <CardHeader>
                  <CardTitle>{cellType} Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Test not completed or data unavailable.</p>
                </CardContent>
              </Card>
            );
          }
          return (
            <Card key={cellType}>
              <CardHeader>
                <CardTitle>{cellType} Test Results</CardTitle>
                <CardDescription>
                  {testResult.completed ? "Completed" : "In Progress"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Accuracy:</strong> {testResult.accuracy?.toFixed(1) ?? 0}%</p>
                <p>
                  <strong>Score:</strong> {testResult.correctAnswers ?? 0} / {testResult.answeredQuestions ?? 0}
                </p>
                <p><strong>Answered:</strong> {testResult.answeredQuestions ?? 0} / {testResult.totalQuestions ?? 0}</p>
                <p><strong>Time Taken:</strong> {formatDuration(testResult.startTime, testResult.endTime)}</p>
                {testResult.comment && <p><strong>Comment:</strong> {testResult.comment}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div>
        <DialogThankyou />
      </div>
    </main>
  );
};

export default Page;
