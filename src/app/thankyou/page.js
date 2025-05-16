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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const { testerInfo, results, overall } = allResults;

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
      <div className="isolate z-0 flex w-full max-w-4xl flex-col gap-8">
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

      {/* Overall Metrics Card */}
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Overall Performance Metrics</CardTitle>
          <CardDescription>Combined results from all tests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex flex-col items-center rounded-md border p-3">
              <span className="text-muted-foreground text-sm">Accuracy</span>
              <span className="text-2xl font-bold">
                {overall.accuracy.toFixed(1)}%
              </span>
            </div>
            <div className="flex flex-col items-center rounded-md border p-3">
              <span className="text-muted-foreground text-sm">Precision</span>
              <span className="text-2xl font-bold">
                {overall.precision.toFixed(1)}%
              </span>
            </div>
            <div className="flex flex-col items-center rounded-md border p-3">
              <span className="text-muted-foreground text-sm">Recall</span>
              <span className="text-2xl font-bold">
                {overall.recall.toFixed(1)}%
              </span>
            </div>
            <div className="flex flex-col items-center rounded-md border p-3">
              <span className="text-muted-foreground text-sm">F1 Score</span>
              <span className="text-2xl font-bold">
                {overall.f1Score.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Confusion Matrix Explanation */}
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-medium">
              Confusion Matrix Explained
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-md border p-3">
                <p className="font-medium">
                  True Positive (TP): {overall.confusionMatrix.truePositives}
                </p>
                <p className="text-muted-foreground text-sm">
                  Real images correctly identified as real
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="font-medium">
                  False Positive (FP): {overall.confusionMatrix.falsePositives}
                </p>
                <p className="text-muted-foreground text-sm">
                  Fake images incorrectly identified as real
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="font-medium">
                  False Negative (FN): {overall.confusionMatrix.falseNegatives}
                </p>
                <p className="text-muted-foreground text-sm">
                  Real images incorrectly identified as fake
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="font-medium">
                  True Negative (TN): {overall.confusionMatrix.trueNegatives}
                </p>
                <p className="text-muted-foreground text-sm">
                  Fake images correctly identified as fake
                </p>
              </div>
            </div>
          </div>

          {/* Overall Confusion Matrix */}
          <div>
            {/* <h3 className="text-lg font-medium mb-2">Confusion Matrix</h3>
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="p-2 border rounded-md">
                <p>TP: {overall.confusionMatrix?.truePositives ?? 0}</p>
                <p className="text-muted-foreground">Real as Real</p>
              </div>
              <div className="p-2 border rounded-md">
                <p>TN: {overall.confusionMatrix?.trueNegatives ?? 0}</p>
                <p className="text-muted-foreground">Fake as Fake</p>
              </div>
              <div className="p-2 border rounded-md">
                <p>FP: {overall.confusionMatrix?.falsePositives ?? 0}</p>
                <p className="text-muted-foreground">Fake as Real</p>
              </div>
              <div className="p-2 border rounded-md">
                <p>FN: {overall.confusionMatrix?.falseNegatives ?? 0}</p>
                <p className="text-muted-foreground">Real as Fake</p>
              </div>
            </div> */}
            <Table>
              <TableCaption>
                Overall confusion matrix for all tests
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]"></TableHead>
                  <TableHead>Predicted Real</TableHead>
                  <TableHead>Predicted Fake</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Actual Real</TableCell>
                  <TableCell className="bg-green-100">
                    {overall.confusionMatrix?.truePositives ?? 0}
                  </TableCell>
                  <TableCell className="bg-red-100">
                    {overall.confusionMatrix?.falseNegatives ?? 0}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Actual Fake</TableCell>
                  <TableCell className="bg-red-100">
                    {overall.confusionMatrix?.falsePositives ?? 0}
                  </TableCell>
                  <TableCell className="bg-green-100">
                    {overall.confusionMatrix?.trueNegatives ?? 0}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pie Charts Section - keep existing code */}
      <div className="isolate z-0 flex w-full max-w-4xl flex-col gap-8">
        {/* Accuracy Pie Chart */}
        {/* <Card>
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
        </Card> */}

        {/* Correct vs Incorrect Pie Chart */}
        {/* <Card>
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
        </Card> */}

        {/* Time Spent Pie Chart */}
        {/* <Card>
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
        </Card> */}
      </div>

      {/* Individual Test Results Cards with Metrics and Confusion Matrices */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-6">
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
            <Card key={cellType} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{cellType} Test Results</CardTitle>
                <CardDescription>
                  {testResult.completed ? "Completed" : "In Progress"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="flex flex-col items-center rounded-md border p-3">
                    <span className="text-muted-foreground text-sm">
                      Accuracy
                    </span>
                    <span className="text-2xl font-bold">
                      {testResult.accuracy?.toFixed(1) ?? 0}%
                    </span>
                  </div>
                  <div className="flex flex-col items-center rounded-md border p-3">
                    <span className="text-muted-foreground text-sm">
                      Precision
                    </span>
                    <span className="text-2xl font-bold">
                      {testResult.precision?.toFixed(1) ?? 0}%
                    </span>
                  </div>
                  <div className="flex flex-col items-center rounded-md border p-3">
                    <span className="text-muted-foreground text-sm">
                      Recall
                    </span>
                    <span className="text-2xl font-bold">
                      {testResult.recall?.toFixed(1) ?? 0}%
                    </span>
                  </div>
                  <div className="flex flex-col items-center rounded-md border p-3">
                    <span className="text-muted-foreground text-sm">
                      F1 Score
                    </span>
                    <span className="text-2xl font-bold">
                      {testResult.f1Score?.toFixed(1) ?? 0}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Basic Stats</h3>
                    <p className="text-sm">
                      <strong>Score:</strong> {testResult.correctAnswers ?? 0} /{" "}
                      {testResult.answeredQuestions ?? 0}
                    </p>
                    <p className="text-sm">
                      <strong>Answered:</strong>{" "}
                      {testResult.answeredQuestions ?? 0} /{" "}
                      {testResult.totalQuestions ?? 0}
                    </p>
                    <p className="text-sm">
                      <strong>Time Taken:</strong>{" "}
                      {formatDuration(testResult.startTime, testResult.endTime)}
                    </p>
                    {testResult.comment && (
                      <p className="text-sm">
                        <strong>Comment:</strong> {testResult.comment}
                      </p>
                    )}
                  </div>

                  <div>
                    <div></div>
                    <h3 className="mb-2 text-lg font-medium">
                      Confusion Matrix
                    </h3>
                    <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-md border p-2">
                        <p>
                          TP: {testResult.confusionMatrix?.truePositives ?? 0}
                        </p>
                        <p className="text-muted-foreground">Real as Real</p>
                      </div>
                      <div className="rounded-md border p-2">
                        <p>
                          FN: {testResult.confusionMatrix?.falseNegatives ?? 0}
                        </p>
                        <p className="text-muted-foreground">Real as Fake</p>
                      </div>
                      <div className="rounded-md border p-2">
                        <p>
                          FP: {testResult.confusionMatrix?.falsePositives ?? 0}
                        </p>
                        <p className="text-muted-foreground">Fake as Real</p>
                      </div>
                      <div className="rounded-md border p-2">
                        <p>
                          TN: {testResult.confusionMatrix?.trueNegatives ?? 0}
                        </p>
                        <p className="text-muted-foreground">Fake as Fake</p>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]"></TableHead>
                          <TableHead>Pred. Real</TableHead>
                          <TableHead>Pred. Fake</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Real</TableCell>
                          <TableCell className="bg-green-100">
                            {testResult.confusionMatrix?.truePositives ?? 0}
                          </TableCell>
                          <TableCell className="bg-red-100">
                            {testResult.confusionMatrix?.falseNegatives ?? 0}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Fake</TableCell>
                          <TableCell className="bg-red-100">
                            {testResult.confusionMatrix?.falsePositives ?? 0}
                          </TableCell>
                          <TableCell className="bg-green-100">
                            {testResult.confusionMatrix?.trueNegatives ?? 0}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
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
