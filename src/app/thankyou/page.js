"use client";

import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "@/provider/UserProvider";
import { useRouter } from "next/navigation";
import ParticipantName from "@/components/ParticipantName";
import DialogThankyou from "@/components/DialogThankyou";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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
  if (seconds > 0 || (hours === 0 && minutes === 0))
    durationStr += `${seconds}s`;

  return durationStr.trim() || "0s";
};

// Colors for the charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const Page = () => {
  const { supervisor, tester, exportAllResults } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [allResults, setAllResults] = useState(null);
  const [chartData, setChartData] = useState({
    accuracy: [],
    correctVsIncorrect: [],
    timeSpent: [],
  });
  const [activeTab, setActiveTab] = useState("accuracy");
  const router = useRouter();

  useEffect(() => {
    // Redirect if essential data is missing (user might have landed here directly)
    if (!supervisor || !tester) {
      router.push("/");
    } else {
      const results = exportAllResults();
      setAllResults(results);

      // Prepare chart data
      if (results && results.results) {
        const accuracyData = [];
        const correctVsIncorrectData = [];
        const timeSpentData = [];

        Object.entries(results.results).forEach(([cellType, data]) => {
          if (data) {
            // Accuracy data
            accuracyData.push({
              name: cellType,
              accuracy: parseFloat(data.accuracy?.toFixed(1) || 0),
            });

            // Correct vs Incorrect data
            correctVsIncorrectData.push({
              name: cellType,
              correct: data.correctAnswers || 0,
              incorrect:
                (data.answeredQuestions || 0) - (data.correctAnswers || 0),
            });

            // Time spent data
            if (data.startTime && data.endTime) {
              const timeInMinutes =
                (new Date(data.endTime) - new Date(data.startTime)) /
                (1000 * 60);
              timeSpentData.push({
                name: cellType,
                minutes: parseFloat(timeInMinutes.toFixed(1)),
              });
            }
          }
        });

        setChartData({
          accuracy: accuracyData,
          correctVsIncorrect: correctVsIncorrectData,
          timeSpent: timeSpentData,
        });
      }

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

  // Prepare pie chart data for overall performance
  const totalCorrect = Object.values(results).reduce(
    (sum, result) => sum + (result?.correctAnswers || 0),
    0
  );
  const totalAnswered = Object.values(results).reduce(
    (sum, result) => sum + (result?.answeredQuestions || 0),
    0
  );
  const totalIncorrect = totalAnswered - totalCorrect;

  // Pie data for correct vs incorrect
  const overallPieData = [
    { name: "Correct", value: totalCorrect },
    { name: "Incorrect", value: totalIncorrect },
  ];

  // Pie data for accuracy per test
  const accuracyPieData = Object.entries(results).map(([cellType, data]) => ({
    name: cellType,
    value: Number(data?.accuracy?.toFixed(1) || 0),
  }));

  // Pie data for time spent per test
  const timePieData = Object.entries(results).map(([cellType, data]) => {
    let minutes = 0;
    if (data?.startTime && data?.endTime) {
      minutes =
        (new Date(data.endTime) - new Date(data.startTime)) / (1000 * 60);
    }
    return {
      name: cellType,
      value: Number(minutes.toFixed(1)),
    };
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 p-4 py-10 md:p-16">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-4xl font-medium md:text-6xl">
          Thank You for Your Participation, <ParticipantName />!
        </h2>
        <p className="text-lg">Here is a summary of your test results.</p>
      </div>

      {testerInfo && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Participant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <strong>Tester:</strong> {testerInfo.tester}
            </p>
            <p>
              <strong>Supervisor:</strong> {testerInfo.supervisor}
            </p>
            <p>
              <strong>Institution:</strong> {testerInfo.institution}
            </p>
            {testerInfo.faculty && (
              <p>
                <strong>Faculty:</strong> {testerInfo.faculty}
              </p>
            )}
            {testerInfo.department && (
              <p>
                <strong>Department:</strong> {testerInfo.department}
              </p>
            )}
            {testerInfo.speciality && (
              <p>
                <strong>Speciality:</strong> {testerInfo.speciality}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pie Charts Section */}
      <div className="z-0 isolate flex w-full max-w-4xl flex-col gap-8">
        {/* Accuracy Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Accuracy (%)</CardTitle>
            <CardDescription>Proportion of accuracy per test</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={accuracyPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {accuracyPieData.map((entry, index) => (
                    <Cell
                      key={`cell-acc-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Accuracy"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Correct vs Incorrect Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Correct vs Incorrect</CardTitle>
            <CardDescription>All tests combined</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overallPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {overallPieData.map((entry, index) => (
                    <Cell
                      key={`cell-corr-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time Spent Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Time Spent (min)</CardTitle>
            <CardDescription>Proportion of time spent per test</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={timePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}m`}
                >
                  {timePieData.map((entry, index) => (
                    <Cell
                      key={`cell-time-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} min`, "Time"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      {/* Keep the Overall Performance Chart separate */}

      {/* Individual Test Results Cards */}
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
                <p>
                  <strong>Accuracy:</strong>{" "}
                  {testResult.accuracy?.toFixed(1) ?? 0}%
                </p>
                <p>
                  <strong>Score:</strong> {testResult.correctAnswers ?? 0} /{" "}
                  {testResult.answeredQuestions ?? 0}
                </p>
                <p>
                  <strong>Answered:</strong> {testResult.answeredQuestions ?? 0}{" "}
                  / {testResult.totalQuestions ?? 0}
                </p>
                <p>
                  <strong>Time Taken:</strong>{" "}
                  {formatDuration(testResult.startTime, testResult.endTime)}
                </p>
                {testResult.comment && (
                  <p>
                    <strong>Comment:</strong> {testResult.comment}
                  </p>
                )}
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
