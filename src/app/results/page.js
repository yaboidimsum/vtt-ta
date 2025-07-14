"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
} from "chart.js";
import { Bar, Pie, Radar, Line } from "react-chartjs-2";
import html2canvas from "html2canvas";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
);

export default function ResultsDashboard() {
  const [testersData, setTestersData] = useState([]);
  const [selectedTester, setSelectedTester] = useState(null);
  const [summaryStats, setSummaryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    // Fetch all tester data
    const fetchData = async () => {
      try {
        const response = await fetch("/api/tester-results");
        if (!response.ok) {
          throw new Error("Failed to fetch tester results");
        }
        const data = await response.json();
        setTestersData(data);

        // Calculate summary statistics
        calculateSummaryStats(data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateSummaryStats = (data) => {
    if (!data || data.length === 0) return;

    // Calculate average metrics across all testers
    const avgMetrics = {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      specificity: 0,
    };

    let totalTesters = data.length;

    // Sum up all metrics
    data.forEach((tester) => {
      if (tester.overall) {
        avgMetrics.accuracy += tester.overall.accuracy || 0;
        avgMetrics.precision += tester.overall.precision || 0;
        avgMetrics.recall += tester.overall.recall || 0;
        avgMetrics.f1Score += tester.overall.f1Score || 0;
        avgMetrics.specificity += tester.overall.specificity || 0;
      }
    });

    // Calculate averages
    Object.keys(avgMetrics).forEach((key) => {
      avgMetrics[key] = avgMetrics[key] / totalTesters;
    });

    // Calculate cell type statistics
    const cellTypeStats = {
      L1: {
        avgAccuracy: 0,
        avgPrecision: 0,
        avgRecall: 0,
        avgF1: 0,
        avgSpecificity: 0,
      },
      L2: {
        avgAccuracy: 0,
        avgPrecision: 0,
        avgRecall: 0,
        avgF1: 0,
        avgSpecificity: 0,
      },
      L3: {
        avgAccuracy: 0,
        avgPrecision: 0,
        avgRecall: 0,
        avgF1: 0,
        avgSpecificity: 0,
      },
    };

    // Sum up metrics for each cell type
    data.forEach((tester) => {
      if (tester.results) {
        Object.keys(cellTypeStats).forEach((cellType) => {
          if (tester.results[cellType]) {
            cellTypeStats[cellType].avgAccuracy +=
              tester.results[cellType].accuracy || 0;
            cellTypeStats[cellType].avgPrecision +=
              tester.results[cellType].precision || 0;
            cellTypeStats[cellType].avgRecall +=
              tester.results[cellType].recall || 0;
            cellTypeStats[cellType].avgF1 +=
              tester.results[cellType].f1Score || 0;
            cellTypeStats[cellType].avgSpecificity +=
              tester.results[cellType].specificity || 0;
          }
        });
      }
    });

    // Calculate averages for each cell type
    Object.keys(cellTypeStats).forEach((cellType) => {
      Object.keys(cellTypeStats[cellType]).forEach((metric) => {
        cellTypeStats[cellType][metric] =
          cellTypeStats[cellType][metric] / totalTesters;
      });
    });

    setSummaryStats({
      totalTesters,
      avgMetrics,
      cellTypeStats,
    });
  };

  const handleTesterSelect = (tester) => {
    setSelectedTester(tester);
    setActiveTab("tester");
  };

  const downloadChart = (chartRef, filename) => {
    if (chartRef && chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading results data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">VTT Results Dashboard</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="summary">Overall Summary</TabsTrigger>
          <TabsTrigger value="summaryExcluding">
            Overall (Excluding Dr. Lyana)
          </TabsTrigger>
          <TabsTrigger value="tester" disabled={!selectedTester}>
            {selectedTester
              ? `${selectedTester.testerInfo.tester}'s Results`
              : "Tester Results"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <SummaryView
            testersData={testersData}
            summaryStats={summaryStats}
            onTesterSelect={handleTesterSelect}
            downloadChart={downloadChart}
          />
        </TabsContent>

        <TabsContent value="summaryExcluding" className="space-y-6">
          <SummaryViewExcluding
            testersData={testersData}
            onTesterSelect={handleTesterSelect}
            downloadChart={downloadChart}
          />
        </TabsContent>

        <TabsContent value="tester" className="space-y-6">
          {selectedTester && (
            <TesterView tester={selectedTester} downloadChart={downloadChart} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryView({
  testersData,
  summaryStats,
  onTesterSelect,
  downloadChart,
}) {
  // Create refs for all charts
  const chartRefs = {
    overallAccuracy: React.useRef(null),
    overallPrecision: React.useRef(null),
    overallRecall: React.useRef(null),
    overallF1: React.useRef(null),
    overallSpecificity: React.useRef(null),
    avgAccuracy: React.useRef(null),
    avgPrecision: React.useRef(null),
    avgRecall: React.useRef(null),
    avgF1: React.useRef(null),
    avgSpecificity: React.useRef(null),
    cellTypeComparison: React.useRef(null),
    metricsDistribution: React.useRef(null),
  };

  if (!summaryStats) {
    return (
      <div className="py-10 text-center">
        No summary data available. Please check if data is loaded correctly.
      </div>
    );
  }

  // Helper function to create chart data for individual metrics
  const createMetricChartData = (metricName, color) => ({
    labels: testersData.map((tester) => tester.testerInfo.tester),
    datasets: [
      {
        label: `${metricName} (${metricName === "F1 Score" ? "" : "%"})`,
        data: testersData.map((tester) => {
          const key = metricName.toLowerCase().replace(" ", "");
          return tester.overall?.[key] || 0;
        }),
        backgroundColor: `${color}60`,
        borderColor: color,
        borderWidth: 1,
      },
    ],
  });

  // Helper function to create average metric chart data for cell types
  const createAvgMetricChartData = (metricName, color) => ({
    labels: Object.keys(summaryStats.cellTypeStats),
    datasets: [
      {
        label: `Average ${metricName} (${
          metricName === "F1 Score" ? "" : "%"
        })`,
        data: Object.values(summaryStats.cellTypeStats).map((stats) => {
          const key = `avg${metricName.replace(" ", "")}`;
          return stats[key] || 0;
        }),
        backgroundColor: `${color}60`,
        borderColor: color,
        borderWidth: 1,
      },
    ],
  });

  // Chart data definitions
  const chartData = {
    overallAccuracy: createMetricChartData("Accuracy", "rgba(75, 192, 192, 1)"),
    overallPrecision: createMetricChartData(
      "Precision",
      "rgba(54, 162, 235, 1)"
    ),
    overallRecall: createMetricChartData("Recall", "rgba(255, 206, 86, 1)"),
    overallF1: createMetricChartData("F1", "rgba(153, 102, 255, 1)"),
    overallSpecificity: createMetricChartData(
      "Specificity",
      "rgba(255, 99, 132, 1)"
    ),
    avgAccuracy: createAvgMetricChartData("Accuracy", "rgba(75, 192, 192, 1)"),
    avgPrecision: createAvgMetricChartData(
      "Precision",
      "rgba(54, 162, 235, 1)"
    ),
    avgRecall: createAvgMetricChartData("Recall", "rgba(255, 206, 86, 1)"),
    avgF1: createAvgMetricChartData("F1", "rgba(153, 102, 255, 1)"),
    avgSpecificity: createAvgMetricChartData(
      "Specificity",
      "rgba(255, 99, 132, 1)"
    ),
  };

  // Cell Type Comparison Chart Data
  const cellTypeComparisonData = {
    labels: Object.keys(summaryStats.cellTypeStats),
    datasets: [
      {
        label: "Average Accuracy (%)",
        data: Object.values(summaryStats.cellTypeStats).map(
          (stats) => stats.avgAccuracy
        ),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Average Precision (%)",
        data: Object.values(summaryStats.cellTypeStats).map(
          (stats) => stats.avgPrecision
        ),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
      {
        label: "Average Recall (%)",
        data: Object.values(summaryStats.cellTypeStats).map(
          (stats) => stats.avgRecall
        ),
        backgroundColor: "rgba(255, 206, 86, 0.6)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
      },
      {
        label: "Average F1 Score",
        data: Object.values(summaryStats.cellTypeStats).map(
          (stats) => stats.avgF1
        ),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
      {
        label: "Average Specificity (%)",
        data: Object.values(summaryStats.cellTypeStats).map(
          (stats) => stats.avgSpecificity
        ),
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Metrics Distribution Radar Chart Data
  const metricsDistributionData = {
    labels: ["Accuracy", "Precision", "Recall", "F1 Score", "Specificity"],
    datasets: [
      {
        label: "Average Metrics",
        data: [
          summaryStats.avgMetrics.accuracy,
          summaryStats.avgMetrics.precision,
          summaryStats.avgMetrics.recall,
          summaryStats.avgMetrics.f1Score,
          summaryStats.avgMetrics.specificity,
        ],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const f1ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
      },
    },
  };

  return (
    <div>
      {/* Summary Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Testers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryStats.totalTesters}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Avg Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {summaryStats.avgMetrics.accuracy.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Avg Precision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {summaryStats.avgMetrics.precision.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">
              Avg Recall
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">
              {summaryStats.avgMetrics.recall.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Avg F1 Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {summaryStats.avgMetrics.f1Score.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">
              Avg Specificity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {summaryStats.avgMetrics.specificity.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Metric Charts - Overall Results by Tester */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">
          Overall Results by Tester
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Overall Accuracy */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Accuracy by Tester</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.overallAccuracy} className="h-80">
                <Bar data={chartData.overallAccuracy} options={chartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    chartRefs.overallAccuracy,
                    "overall-accuracy-by-tester"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Overall Precision */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Precision by Tester</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.overallPrecision} className="h-80">
                <Bar data={chartData.overallPrecision} options={chartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    chartRefs.overallPrecision,
                    "overall-precision-by-tester"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Overall Recall */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Recall by Tester</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.overallRecall} className="h-80">
                <Bar data={chartData.overallRecall} options={chartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    chartRefs.overallRecall,
                    "overall-recall-by-tester"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Overall F1 Score */}
          <Card>
            <CardHeader>
              <CardTitle>Overall F1 Score by Tester</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.overallF1} className="h-80">
                <Bar data={chartData.overallF1} options={f1ChartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(chartRefs.overallF1, "overall-f1-by-tester")
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Overall Specificity */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Specificity by Tester</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.overallSpecificity} className="h-80">
                <Bar
                  data={chartData.overallSpecificity}
                  options={chartOptions}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    chartRefs.overallSpecificity,
                    "overall-specificity-by-tester"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Average Metric Charts by Cell Type */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">
          Average Results by Cell Type
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Average Accuracy by Cell Type */}
          <Card>
            <CardHeader>
              <CardTitle>Average Accuracy by Cell Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.avgAccuracy} className="h-80">
                <Bar data={chartData.avgAccuracy} options={chartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    chartRefs.avgAccuracy,
                    "avg-accuracy-by-cell-type"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Average Precision by Cell Type */}
          <Card>
            <CardHeader>
              <CardTitle>Average Precision by Cell Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.avgPrecision} className="h-80">
                <Bar data={chartData.avgPrecision} options={chartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    chartRefs.avgPrecision,
                    "avg-precision-by-cell-type"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Average Recall by Cell Type */}
          <Card>
            <CardHeader>
              <CardTitle>Average Recall by Cell Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.avgRecall} className="h-80">
                <Bar data={chartData.avgRecall} options={chartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(chartRefs.avgRecall, "avg-recall-by-cell-type")
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Average F1 Score by Cell Type */}
          <Card>
            <CardHeader>
              <CardTitle>Average F1 Score by Cell Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.avgF1} className="h-80">
                <Bar data={chartData.avgF1} options={f1ChartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(chartRefs.avgF1, "avg-f1-by-cell-type")
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Average Specificity by Cell Type */}
          <Card>
            <CardHeader>
              <CardTitle>Average Specificity by Cell Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.avgSpecificity} className="h-80">
                <Bar data={chartData.avgSpecificity} options={chartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    chartRefs.avgSpecificity,
                    "avg-specificity-by-cell-type"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Combined Charts Section */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cell Type Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={chartRefs.cellTypeComparison} className="h-80">
              <Bar
                data={cellTypeComparisonData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 flex items-center gap-2"
              onClick={() =>
                downloadChart(
                  chartRefs.cellTypeComparison,
                  "cell-type-comparison"
                )
              }
            >
              <Download className="h-4 w-4" />
              Download Chart
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Metrics Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={chartRefs.metricsDistribution}
              className="mx-auto h-80 max-w-md"
            >
              <Radar
                data={metricsDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      min: 0,
                      max: 100,
                      ticks: {
                        stepSize: 20,
                      },
                    },
                  },
                }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 flex items-center gap-2"
              onClick={() =>
                downloadChart(
                  chartRefs.metricsDistribution,
                  "metrics-distribution"
                )
              }
            >
              <Download className="h-4 w-4" />
              Download Chart
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Individual Tester Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Tester Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testersData.map((tester, index) => (
              <Card
                key={index}
                className="cursor-pointer transition-all duration-200 ease-in-out hover:bg-blue-50 hover:shadow-lg"
                onClick={() => onTesterSelect(tester)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-blue-600">
                    {tester.testerInfo.tester}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        Institution:
                      </span>
                      <span className="text-sm font-medium">
                        {tester.testerInfo.institution}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Accuracy:</span>
                      <span className="text-sm font-medium">
                        {tester.overall?.accuracy.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">F1 Score:</span>
                      <span className="text-sm font-medium">
                        {tester.overall?.f1Score.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryViewExcluding({ testersData, onTesterSelect, downloadChart }) {
  // Filter out Lyana Setiawan's data (no Dr prefix, trim whitespace)
  const filteredData = testersData.filter(
    (tester) => tester.testerInfo.tester.trim() !== "Lyana Setiawan"
  );

  // Create refs for all charts (move to top, before any return)
  const chartRefs = {
    overallAccuracy: React.useRef(null),
    overallPrecision: React.useRef(null),
    overallRecall: React.useRef(null),
    overallF1: React.useRef(null),
    overallSpecificity: React.useRef(null),
    avgAccuracy: React.useRef(null),
    avgPrecision: React.useRef(null),
    avgRecall: React.useRef(null),
    avgF1: React.useRef(null),
    avgSpecificity: React.useRef(null),
    cellTypeComparison: React.useRef(null),
    metricsDistribution: React.useRef(null),
    combinedConfusion: React.useRef(null),
    combinedConfusionL1: React.useRef(null),
    combinedConfusionL2: React.useRef(null),
    combinedConfusionL3: React.useRef(null),
  };

  // Calculate summary statistics for filtered data
  const calculateFilteredStats = (data) => {
    if (!data || data.length === 0) return null;

    // Calculate average metrics across filtered testers
    const avgMetrics = {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      specificity: 0,
    };

    let totalTesters = data.length;

    // Sum up all metrics
    data.forEach((tester) => {
      if (tester.overall) {
        avgMetrics.accuracy += tester.overall.accuracy || 0;
        avgMetrics.precision += tester.overall.precision || 0;
        avgMetrics.recall += tester.overall.recall || 0;
        avgMetrics.f1Score += tester.overall.f1Score || 0;
        avgMetrics.specificity += tester.overall.specificity || 0;
      }
    });

    // Calculate averages
    Object.keys(avgMetrics).forEach((key) => {
      avgMetrics[key] = avgMetrics[key] / totalTesters;
    });

    // Calculate cell type statistics
    const cellTypeStats = {
      L1: {
        avgAccuracy: 0,
        avgPrecision: 0,
        avgRecall: 0,
        avgF1: 0,
        avgSpecificity: 0,
      },
      L2: {
        avgAccuracy: 0,
        avgPrecision: 0,
        avgRecall: 0,
        avgF1: 0,
        avgSpecificity: 0,
      },
      L3: {
        avgAccuracy: 0,
        avgPrecision: 0,
        avgRecall: 0,
        avgF1: 0,
        avgSpecificity: 0,
      },
    };

    // Sum up metrics for each cell type
    data.forEach((tester) => {
      if (tester.results) {
        Object.keys(cellTypeStats).forEach((cellType) => {
          if (tester.results[cellType]) {
            cellTypeStats[cellType].avgAccuracy +=
              tester.results[cellType].accuracy || 0;
            cellTypeStats[cellType].avgPrecision +=
              tester.results[cellType].precision || 0;
            cellTypeStats[cellType].avgRecall +=
              tester.results[cellType].recall || 0;
            cellTypeStats[cellType].avgF1 +=
              tester.results[cellType].f1Score || 0;
            cellTypeStats[cellType].avgSpecificity +=
              tester.results[cellType].specificity || 0;
          }
        });
      }
    });

    // Calculate averages for each cell type
    Object.keys(cellTypeStats).forEach((cellType) => {
      Object.keys(cellTypeStats[cellType]).forEach((metric) => {
        cellTypeStats[cellType][metric] =
          cellTypeStats[cellType][metric] / totalTesters;
      });
    });

    return {
      totalTesters,
      avgMetrics,
      cellTypeStats,
    };
  };

  const filteredStats = calculateFilteredStats(filteredData);

  // Calculate combined confusion matrix for L1, L2, L3
  const combinedConfusion = { TP: 0, TN: 0, FP: 0, FN: 0 };
  filteredData.forEach((tester) => {
    ["L1", "L2", "L3"].forEach((cellType) => {
      const cm = tester.results[cellType]?.confusionMatrix;
      if (cm) {
        combinedConfusion.TP += cm.truePositives || 0;
        combinedConfusion.TN += cm.trueNegatives || 0;
        combinedConfusion.FP += cm.falsePositives || 0;
        combinedConfusion.FN += cm.falseNegatives || 0;
      }
    });
  });

  // Pie chart data for combined confusion matrix (overall)
  const combinedConfusionPieData = {
    labels: [
      "True Positives",
      "True Negatives",
      "False Positives",
      "False Negatives",
    ],
    datasets: [
      {
        data: [
          combinedConfusion.TP,
          combinedConfusion.TN,
          combinedConfusion.FP,
          combinedConfusion.FN,
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)", // TP
          "rgba(54, 162, 235, 0.6)", // TN
          "rgba(255, 99, 132, 0.6)", // FP
          "rgba(255, 159, 64, 0.6)", // FN
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Calculate combined confusion matrix for each cell type
  const combinedConfusionByCellType = {
    L1: { TP: 0, TN: 0, FP: 0, FN: 0 },
    L2: { TP: 0, TN: 0, FP: 0, FN: 0 },
    L3: { TP: 0, TN: 0, FP: 0, FN: 0 },
  };
  ["L1", "L2", "L3"].forEach((cellType) => {
    filteredData.forEach((tester) => {
      const cm = tester.results[cellType]?.confusionMatrix;
      if (cm) {
        combinedConfusionByCellType[cellType].TP += cm.truePositives || 0;
        combinedConfusionByCellType[cellType].TN += cm.trueNegatives || 0;
        combinedConfusionByCellType[cellType].FP += cm.falsePositives || 0;
        combinedConfusionByCellType[cellType].FN += cm.falseNegatives || 0;
      }
    });
  });

  // Pie chart data for combined confusion matrix by cell type
  const combinedConfusionPieDataByCellType = {
    L1: {
      labels: [
        "True Positives",
        "True Negatives",
        "False Positives",
        "False Negatives",
      ],
      datasets: [
        {
          data: [
            combinedConfusionByCellType.L1.TP,
            combinedConfusionByCellType.L1.TN,
            combinedConfusionByCellType.L1.FP,
            combinedConfusionByCellType.L1.FN,
          ],
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    L2: {
      labels: [
        "True Positives",
        "True Negatives",
        "False Positives",
        "False Negatives",
      ],
      datasets: [
        {
          data: [
            combinedConfusionByCellType.L2.TP,
            combinedConfusionByCellType.L2.TN,
            combinedConfusionByCellType.L2.FP,
            combinedConfusionByCellType.L2.FN,
          ],
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    L3: {
      labels: [
        "True Positives",
        "True Negatives",
        "False Positives",
        "False Negatives",
      ],
      datasets: [
        {
          data: [
            combinedConfusionByCellType.L3.TP,
            combinedConfusionByCellType.L3.TN,
            combinedConfusionByCellType.L3.FP,
            combinedConfusionByCellType.L3.FN,
          ],
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
  };

  // Helper to calculate metrics from confusion matrix
  function calcMetrics({ TP, TN, FP, FN }) {
    const total = TP + TN + FP + FN;
    const accuracy = total ? ((TP + TN) / total) * 100 : 0;
    const precision = TP + FP ? (TP / (TP + FP)) * 100 : 0;
    const recall = TP + FN ? (TP / (TP + FN)) * 100 : 0;
    const specificity = TN + FP ? (TN / (TN + FP)) * 100 : 0;
    const f1 =
      precision + recall
        ? (2 * (precision * recall)) / (precision + recall)
        : 0;
    return {
      accuracy,
      precision,
      recall,
      f1,
      specificity,
    };
  }

  const metricsByCellType = {
    L1: calcMetrics(combinedConfusionByCellType.L1),
    L2: calcMetrics(combinedConfusionByCellType.L2),
    L3: calcMetrics(combinedConfusionByCellType.L3),
  };

  // Calculate overall metrics for the combined confusion matrix (all cell types)
  const overallCombinedMetrics = calcMetrics(combinedConfusion);

  if (!filteredStats) {
    return (
      <div className="py-10 text-center">
        No summary data available. Please check if data is loaded correctly.
      </div>
    );
  }

  // Helper function to create chart data for individual metrics
  const createMetricChartData = (metricName, color) => ({
    labels: filteredData.map((tester) => tester.testerInfo.tester),
    datasets: [
      {
        label: `${metricName} (${metricName === "F1 Score" ? "" : "%"})`,
        data: filteredData.map((tester) => {
          const key = metricName.toLowerCase().replace(" ", "");
          return tester.overall?.[key] || 0;
        }),
        backgroundColor: `${color}60`,
        borderColor: color,
        borderWidth: 1,
      },
    ],
  });

  // Helper function to create average metric chart data for cell types
  const createAvgMetricChartData = (metricName, color) => ({
    labels: Object.keys(filteredStats.cellTypeStats),
    datasets: [
      {
        label: `Average ${metricName} (${
          metricName === "F1 Score" ? "" : "%"
        })`,
        data: Object.values(filteredStats.cellTypeStats).map((stats) => {
          const key = `avg${metricName.replace(" ", "")}`;
          return stats[key] || 0;
        }),
        backgroundColor: `${color}60`,
        borderColor: color,
        borderWidth: 1,
      },
    ],
  });

  // Chart data definitions
  const chartData = {
    overallAccuracy: createMetricChartData("Accuracy", "rgba(75, 192, 192, 1)"),
    overallPrecision: createMetricChartData(
      "Precision",
      "rgba(54, 162, 235, 1)"
    ),
    overallRecall: createMetricChartData("Recall", "rgba(255, 206, 86, 1)"),
    overallF1: createMetricChartData("F1", "rgba(153, 102, 255, 1)"),
    overallSpecificity: createMetricChartData(
      "Specificity",
      "rgba(255, 99, 132, 1)"
    ),
    avgAccuracy: createAvgMetricChartData("Accuracy", "rgba(75, 192, 192, 1)"),
    avgPrecision: createAvgMetricChartData(
      "Precision",
      "rgba(54, 162, 235, 1)"
    ),
    avgRecall: createAvgMetricChartData("Recall", "rgba(255, 206, 86, 1)"),
    avgF1: createAvgMetricChartData("F1", "rgba(153, 102, 255, 1)"),
    avgSpecificity: createAvgMetricChartData(
      "Specificity",
      "rgba(255, 99, 132, 1)"
    ),
  };

  // Cell Type Comparison Chart Data
  const cellTypeComparisonData = {
    labels: Object.keys(filteredStats.cellTypeStats),
    datasets: [
      {
        label: "Average Accuracy (%)",
        data: Object.values(filteredStats.cellTypeStats).map(
          (stats) => stats.avgAccuracy
        ),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Average Precision (%)",
        data: Object.values(filteredStats.cellTypeStats).map(
          (stats) => stats.avgPrecision
        ),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
      {
        label: "Average Recall (%)",
        data: Object.values(filteredStats.cellTypeStats).map(
          (stats) => stats.avgRecall
        ),
        backgroundColor: "rgba(255, 206, 86, 0.6)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
      },
      {
        label: "Average F1 Score",
        data: Object.values(filteredStats.cellTypeStats).map(
          (stats) => stats.avgF1
        ),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
      {
        label: "Average Specificity (%)",
        data: Object.values(filteredStats.cellTypeStats).map(
          (stats) => stats.avgSpecificity
        ),
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Metrics Distribution Radar Chart Data
  const metricsDistributionData = {
    labels: ["Accuracy", "Precision", "Recall", "F1 Score", "Specificity"],
    datasets: [
      {
        label: "Average Metrics",
        data: [
          filteredStats.avgMetrics.accuracy,
          filteredStats.avgMetrics.precision,
          filteredStats.avgMetrics.recall,
          filteredStats.avgMetrics.f1Score,
          filteredStats.avgMetrics.specificity,
        ],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const f1ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
      },
    },
  };

  return (
    <div>
      {/* Summary Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Testers (Excluding Dr. Lyana)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredStats.totalTesters}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Avg Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {filteredStats.avgMetrics.accuracy.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Avg Precision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {filteredStats.avgMetrics.precision.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">
              Avg Recall
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">
              {filteredStats.avgMetrics.recall.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Avg F1 Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {filteredStats.avgMetrics.f1Score.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">
              Avg Specificity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {filteredStats.avgMetrics.specificity.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Combined Confusion Matrix Card and Pie Chart */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Combined Confusion Matrix (L1, L2, L3)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="rounded-lg bg-green-100 p-3 text-center shadow-sm">
                  <p className="text-xs font-medium text-green-800 sm:text-sm">
                    True Positives
                  </p>
                  <p className="text-lg font-bold text-green-900 sm:text-xl">
                    {combinedConfusion.TP}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-100 p-3 text-center shadow-sm">
                  <p className="text-xs font-medium text-blue-800 sm:text-sm">
                    True Negatives
                  </p>
                  <p className="text-lg font-bold text-blue-900 sm:text-xl">
                    {combinedConfusion.TN}
                  </p>
                </div>
                <div className="rounded-lg bg-red-100 p-3 text-center shadow-sm">
                  <p className="text-xs font-medium text-red-800 sm:text-sm">
                    False Positives
                  </p>
                  <p className="text-xl font-bold text-red-900">
                    {combinedConfusion.FP}
                  </p>
                </div>
                <div className="rounded-lg bg-orange-100 p-3 text-center shadow-sm">
                  <p className="text-xs font-medium text-orange-800 sm:text-sm">
                    False Negatives
                  </p>
                  <p className="text-lg font-bold text-orange-900 sm:text-xl">
                    {combinedConfusion.FN}
                  </p>
                </div>
              </div>
              <div
                ref={chartRefs.combinedConfusion}
                className="mx-auto h-60 w-60 md:h-64 md:w-64"
              >
                <Pie
                  data={combinedConfusionPieData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 flex items-center gap-2"
                  onClick={() =>
                    downloadChart(
                      chartRefs.combinedConfusion,
                      "combined-confusion-matrix-excluding"
                    )
                  }
                >
                  <Download className="h-4 w-4" />
                  Download Confusion Matrix
                </Button>
              </div>
            </div>
            {/* Overall metrics for all cell types combined */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs md:text-sm">
              <div>
                <b>Accuracy:</b> {overallCombinedMetrics.accuracy.toFixed(2)}%
              </div>
              <div>
                <b>Precision:</b> {overallCombinedMetrics.precision.toFixed(2)}%
              </div>
              <div>
                <b>Recall:</b> {overallCombinedMetrics.recall.toFixed(2)}%
              </div>
              <div>
                <b>F1 Score:</b> {overallCombinedMetrics.f1.toFixed(2)}
              </div>
              <div>
                <b>Specificity:</b>{" "}
                {overallCombinedMetrics.specificity.toFixed(2)}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Combined Confusion Matrix for Each Cell Type */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {["L1", "L2", "L3"].map((cellType) => (
          <Card key={cellType}>
            <CardHeader>
              <CardTitle>Combined Confusion Matrix ({cellType})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="rounded-lg bg-green-100 p-3 text-center shadow-sm">
                    <p className="text-xs font-medium text-green-800 sm:text-sm">
                      True Positives
                    </p>
                    <p className="text-lg font-bold text-green-900 sm:text-xl">
                      {combinedConfusionByCellType[cellType].TP}
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-100 p-3 text-center shadow-sm">
                    <p className="text-xs font-medium text-blue-800 sm:text-sm">
                      True Negatives
                    </p>
                    <p className="text-lg font-bold text-blue-900 sm:text-xl">
                      {combinedConfusionByCellType[cellType].TN}
                    </p>
                  </div>
                  <div className="rounded-lg bg-red-100 p-3 text-center shadow-sm">
                    <p className="text-xs font-medium text-red-800 sm:text-sm">
                      False Positives
                    </p>
                    <p className="text-xl font-bold text-red-900">
                      {combinedConfusionByCellType[cellType].FP}
                    </p>
                  </div>
                  <div className="rounded-lg bg-orange-100 p-3 text-center shadow-sm">
                    <p className="text-xs font-medium text-orange-800 sm:text-sm">
                      False Negatives
                    </p>
                    <p className="text-lg font-bold text-orange-900 sm:text-xl">
                      {combinedConfusionByCellType[cellType].FN}
                    </p>
                  </div>
                </div>
                <div
                  ref={chartRefs[`combinedConfusion${cellType}`]}
                  className="mx-auto h-60 w-60 md:h-64 md:w-64"
                >
                  <Pie
                    data={combinedConfusionPieDataByCellType[cellType]}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 flex items-center gap-2"
                    onClick={() =>
                      downloadChart(
                        chartRefs[`combinedConfusion${cellType}`],
                        `combined-confusion-matrix-${cellType}-excluding`
                      )
                    }
                  >
                    <Download className="h-4 w-4" />
                    Download Confusion Matrix
                  </Button>
                </div>
              </div>
              {/* Metrics for this cell type */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs md:text-sm">
                <div>
                  <b>Accuracy:</b>{" "}
                  {metricsByCellType[cellType].accuracy.toFixed(2)}%
                </div>
                <div>
                  <b>Precision:</b>{" "}
                  {metricsByCellType[cellType].precision.toFixed(2)}%
                </div>
                <div>
                  <b>Recall:</b> {metricsByCellType[cellType].recall.toFixed(2)}
                  %
                </div>
                <div>
                  <b>F1 Score:</b> {metricsByCellType[cellType].f1.toFixed(2)}
                </div>
                <div>
                  <b>Specificity:</b>{" "}
                  {metricsByCellType[cellType].specificity.toFixed(2)}%
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Individual Metric Charts - Overall Results by Tester */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">
          Overall Results by Tester (Excluding Dr. Lyana)
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Overall Accuracy */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Accuracy by Tester</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.overallAccuracy} className="h-80">
                <Bar data={chartData.overallAccuracy} options={chartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    chartRefs.overallAccuracy,
                    "overall-accuracy-by-tester-excluding"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Overall Precision */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Precision by Tester</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.overallPrecision} className="h-80">
                <Bar data={chartData.overallPrecision} options={chartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    chartRefs.overallPrecision,
                    "overall-precision-by-tester-excluding"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Overall Recall */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Recall by Tester</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.overallRecall} className="h-80">
                <Bar data={chartData.overallRecall} options={chartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    chartRefs.overallRecall,
                    "overall-recall-by-tester-excluding"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Overall F1 Score */}
          <Card>
            <CardHeader>
              <CardTitle>Overall F1 Score by Tester</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.overallF1} className="h-80">
                <Bar data={chartData.overallF1} options={f1ChartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    chartRefs.overallF1,
                    "overall-f1-by-tester-excluding"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Overall Specificity */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Specificity by Tester</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.overallSpecificity} className="h-80">
                <Bar
                  data={chartData.overallSpecificity}
                  options={chartOptions}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    chartRefs.overallSpecificity,
                    "overall-specificity-by-tester-excluding"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Average Metric Charts by Cell Type */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">
          Average Results by Cell Type (Excluding Dr. Lyana)
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Average Accuracy by Cell Type */}
          <Card>
            <CardHeader>
              <CardTitle>Average Accuracy by Cell Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.avgAccuracy} className="h-80">
                <Bar data={chartData.avgAccuracy} options={chartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    chartRefs.avgAccuracy,
                    "avg-accuracy-by-cell-type-excluding"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Average Precision by Cell Type */}
          <Card>
            <CardHeader>
              <CardTitle>Average Precision by Cell Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.avgPrecision} className="h-80">
                <Bar data={chartData.avgPrecision} options={chartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    chartRefs.avgPrecision,
                    "avg-precision-by-cell-type-excluding"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Average Recall by Cell Type */}
          <Card>
            <CardHeader>
              <CardTitle>Average Recall by Cell Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.avgRecall} className="h-80">
                <Bar data={chartData.avgRecall} options={chartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    chartRefs.avgRecall,
                    "avg-recall-by-cell-type-excluding"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Average F1 Score by Cell Type */}
          <Card>
            <CardHeader>
              <CardTitle>Average F1 Score by Cell Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.avgF1} className="h-80">
                <Bar data={chartData.avgF1} options={f1ChartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    chartRefs.avgF1,
                    "avg-f1-by-cell-type-excluding"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Average Specificity by Cell Type */}
          <Card>
            <CardHeader>
              <CardTitle>Average Specificity by Cell Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRefs.avgSpecificity} className="h-80">
                <Bar data={chartData.avgSpecificity} options={chartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    chartRefs.avgSpecificity,
                    "avg-specificity-by-cell-type-excluding"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Combined Charts Section */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Cell Type Performance Comparison (Excluding Dr. Lyana)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={chartRefs.cellTypeComparison} className="h-80">
              <Bar
                data={cellTypeComparisonData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 flex items-center gap-2"
              onClick={() =>
                downloadChart(
                  chartRefs.cellTypeComparison,
                  "cell-type-comparison-excluding"
                )
              }
            >
              <Download className="h-4 w-4" />
              Download Chart
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Average Metrics Distribution (Excluding Dr. Lyana)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={chartRefs.metricsDistribution}
              className="mx-auto h-80 max-w-md"
            >
              <Radar
                data={metricsDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      min: 0,
                      max: 100,
                      ticks: {
                        stepSize: 20,
                      },
                    },
                  },
                }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 flex items-center gap-2"
              onClick={() =>
                downloadChart(
                  chartRefs.metricsDistribution,
                  "metrics-distribution-excluding"
                )
              }
            >
              <Download className="h-4 w-4" />
              Download Chart
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Individual Tester Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Tester Results (Excluding Dr. Lyana)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredData.map((tester, index) => (
              <Card
                key={index}
                className="cursor-pointer transition-all duration-200 ease-in-out hover:bg-blue-50 hover:shadow-lg"
                onClick={() => onTesterSelect(tester)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-blue-600">
                    {tester.testerInfo.tester}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        Institution:
                      </span>
                      <span className="text-sm font-medium">
                        {tester.testerInfo.institution}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Accuracy:</span>
                      <span className="text-sm font-medium">
                        {tester.overall?.accuracy.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">F1 Score:</span>
                      <span className="text-sm font-medium">
                        {tester.overall?.f1Score.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TesterView({ tester, downloadChart }) {
  const accuracyChartRef = React.useRef(null);
  const precisionChartRef = React.useRef(null);
  const recallChartRef = React.useRef(null);
  const f1ChartRef = React.useRef(null);
  const specificityChartRef = React.useRef(null);
  const metricsChartRef = React.useRef(null);
  const confusionChartRefs = React.useRef({});

  if (!tester) {
    return (
      <div className="py-10 text-center">
        Select a tester to view their detailed results.
      </div>
    );
  }

  const { testerInfo, results, overall } = tester;

  // Helper function to create individual metric chart data
  const createTesterMetricData = (metricKey, label, color) => ({
    labels: Object.keys(results),
    datasets: [
      {
        label: label,
        data: Object.values(results).map((result) => result[metricKey] || 0),
        backgroundColor: `${color}60`,
        borderColor: color,
        borderWidth: 1,
      },
    ],
  });

  // Individual metric chart data
  const testerChartData = {
    accuracy: createTesterMetricData(
      "accuracy",
      "Accuracy (%)",
      "rgba(75, 192, 192, 1)"
    ),
    precision: createTesterMetricData(
      "precision",
      "Precision (%)",
      "rgba(54, 162, 235, 1)"
    ),
    recall: createTesterMetricData(
      "recall",
      "Recall (%)",
      "rgba(255, 206, 86, 1)"
    ),
    f1Score: createTesterMetricData(
      "f1Score",
      "F1 Score",
      "rgba(153, 102, 255, 1)"
    ),
    specificity: createTesterMetricData(
      "specificity",
      "Specificity (%)",
      "rgba(255, 99, 132, 1)"
    ),
  };

  // Prepare data for Metrics Radar Chart
  const metricsData = {
    labels: ["Accuracy", "Precision", "Recall", "F1 Score", "Specificity"],
    datasets: Object.keys(results).map((cellType, index) => ({
      label: cellType,
      data: [
        results[cellType].accuracy,
        results[cellType].precision,
        results[cellType].recall,
        results[cellType].f1Score,
        results[cellType].specificity || 0,
      ],
      backgroundColor: `rgba(${index * 60 + 50}, ${200 - index * 30}, ${
        150 + index * 40
      }, 0.2)`,
      borderColor: `rgba(${index * 60 + 50}, ${200 - index * 30}, ${
        150 + index * 40
      }, 1)`,
      borderWidth: 1,
    })),
  };

  // Prepare data for Confusion Matrix Pie Charts
  const confusionData = Object.keys(results).map((cellType) => {
    const matrix = results[cellType].confusionMatrix;
    return {
      cellType,
      data: {
        labels: [
          "True Positives",
          "True Negatives",
          "False Positives",
          "False Negatives",
        ],
        datasets: [
          {
            data: [
              matrix.truePositives,
              matrix.trueNegatives,
              matrix.falsePositives,
              matrix.falseNegatives,
            ],
            backgroundColor: [
              "rgba(75, 192, 192, 0.6)", // TP
              "rgba(54, 162, 235, 0.6)", // TN
              "rgba(255, 99, 132, 0.6)", // FP
              "rgba(255, 159, 64, 0.6)", // FN
            ],
            borderColor: [
              "rgba(75, 192, 192, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 99, 132, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
    };
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const f1ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
      },
    },
  };

  return (
    <div>
      {/* Tester Information Card */}
      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-gray-700">
            Tester Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Tester</h3>
              <p className="text-lg font-semibold">{testerInfo.tester}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Supervisor</h3>
              <p className="text-lg font-semibold">{testerInfo.supervisor}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Institution</h3>
              <p className="text-lg font-semibold">{testerInfo.institution}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Faculty</h3>
              <p className="text-lg font-semibold">{testerInfo.faculty}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Department</h3>
              <p className="text-lg font-semibold">{testerInfo.department}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Speciality</h3>
              <p className="text-lg font-semibold">{testerInfo.speciality}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Results Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overall Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-sm text-blue-700">Accuracy</p>
              <p className="text-xl font-bold">
                {overall.accuracy.toFixed(2)}%
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-sm text-green-700">Precision</p>
              <p className="text-xl font-bold">
                {overall.precision.toFixed(2)}%
              </p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4 text-center">
              <p className="text-sm text-yellow-700">Recall</p>
              <p className="text-xl font-bold">{overall.recall.toFixed(2)}%</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4 text-center">
              <p className="text-sm text-purple-700">F1 Score</p>
              <p className="text-xl font-bold">{overall.f1Score.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="text-sm text-red-700">Specificity</p>
              <p className="text-xl font-bold">
                {overall.specificity.toFixed(2)}%
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-500">Total Answered</p>
              <p className="text-xl font-bold">{overall.totalAnswered}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Metric Charts */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">
          Performance Metrics by Cell Type
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Accuracy Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Accuracy by Cell Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={accuracyChartRef} className="h-80">
                <Bar data={testerChartData.accuracy} options={chartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    accuracyChartRef,
                    "tester-accuracy-by-cell-type"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Precision Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Precision by Cell Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={precisionChartRef} className="h-80">
                <Bar data={testerChartData.precision} options={chartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    precisionChartRef,
                    "tester-precision-by-cell-type"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Recall Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Recall by Cell Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={recallChartRef} className="h-80">
                <Bar data={testerChartData.recall} options={chartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(recallChartRef, "tester-recall-by-cell-type")
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* F1 Score Chart */}
          <Card>
            <CardHeader>
              <CardTitle>F1 Score by Cell Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={f1ChartRef} className="h-80">
                <Bar data={testerChartData.f1Score} options={f1ChartOptions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(f1ChartRef, "tester-f1-by-cell-type")
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Specificity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Specificity by Cell Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={specificityChartRef} className="h-80">
                <Bar
                  data={testerChartData.specificity}
                  options={chartOptions}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(
                    specificityChartRef,
                    "tester-specificity-by-cell-type"
                  )
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>

          {/* Combined Metrics Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={metricsChartRef} className="h-80">
                <Radar
                  data={metricsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        min: 0,
                        max: 100,
                        ticks: {
                          stepSize: 20,
                        },
                      },
                    },
                  }}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 flex items-center gap-2"
                onClick={() =>
                  downloadChart(metricsChartRef, "tester-metrics-overview")
                }
              >
                <Download className="h-4 w-4" />
                Download Chart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Individual Cell Type Results */}
      <div className="space-y-6">
        {Object.keys(results).map((cellType, index) => {
          const cellResult = results[cellType];

          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{cellType} Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                  <div className="rounded-lg bg-blue-50 p-4 text-center">
                    <p className="text-sm text-blue-700">Accuracy</p>
                    <p className="text-xl font-bold">{cellResult.accuracy}%</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4 text-center">
                    <p className="text-sm text-green-700">Precision</p>
                    <p className="text-xl font-bold">
                      {cellResult.precision.toFixed(2)}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-yellow-50 p-4 text-center">
                    <p className="text-sm text-yellow-700">Recall</p>
                    <p className="text-xl font-bold">
                      {cellResult.recall.toFixed(2)}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-4 text-center">
                    <p className="text-sm text-purple-700">F1 Score</p>
                    <p className="text-xl font-bold">
                      {cellResult.f1Score.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-4 text-center">
                    <p className="text-sm text-red-700">Specificity</p>
                    <p className="text-xl font-bold">
                      {cellResult.specificity?.toFixed(2) || "N/A"}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <p className="text-sm text-gray-500">Total Questions</p>
                    <p className="text-xl font-bold">
                      {cellResult.totalQuestions}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="mb-4 text-lg font-semibold">
                    Confusion Matrix
                  </h3>
                  <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
                    <div
                      ref={(el) => (confusionChartRefs.current[cellType] = el)}
                      className="mx-auto h-60 w-60 md:h-64 md:w-64"
                    >
                      <Pie
                        data={confusionData[index].data}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-green-100 p-3 text-center shadow-sm">
                          <p className="text-xs font-medium text-green-800 sm:text-sm">
                            True Positives
                          </p>
                          <p className="text-lg font-bold text-green-900 sm:text-xl">
                            {cellResult.confusionMatrix.truePositives}
                          </p>
                        </div>
                        <div className="rounded-lg bg-blue-100 p-3 text-center shadow-sm">
                          <p className="text-xs font-medium text-blue-800 sm:text-sm">
                            True Negatives
                          </p>
                          <p className="text-lg font-bold text-blue-900 sm:text-xl">
                            {cellResult.confusionMatrix.trueNegatives}
                          </p>
                        </div>
                        <div className="rounded-lg bg-red-100 p-3 text-center shadow-sm">
                          <p className="text-xs font-medium text-red-800 sm:text-sm">
                            False Positives
                          </p>
                          <p className="text-xl font-bold text-red-900">
                            {cellResult.confusionMatrix.falsePositives}
                          </p>
                        </div>
                        <div className="rounded-lg bg-orange-100 p-3 text-center shadow-sm">
                          <p className="text-xs font-medium text-orange-800 sm:text-sm">
                            False Negatives
                          </p>
                          <p className="text-lg font-bold text-orange-900 sm:text-xl">
                            {cellResult.confusionMatrix.falseNegatives}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 flex items-center gap-2"
                    onClick={() =>
                      downloadChart(
                        confusionChartRefs.current[cellType],
                        `confusion-matrix-${cellType}`
                      )
                    }
                  >
                    <Download className="h-4 w-4" />
                    Download Confusion Matrix
                  </Button>
                </div>

                <div className="mt-6">
                  <h3 className="mb-4 text-lg font-semibold">
                    Question Details
                  </h3>
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-100 uppercase text-gray-600">
                        <tr>
                          <th className="px-4 py-3">Question</th>
                          <th className="px-4 py-3">Your Answer</th>
                          <th className="px-4 py-3">Correct Answer</th>
                          <th className="px-4 py-3">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cellResult.questions &&
                          cellResult.questions.map((question, qIndex) => (
                            <tr
                              key={qIndex}
                              className="border-b bg-gray-50 hover:bg-gray-100"
                            >
                              <td className="px-4 py-3">{question.question}</td>
                              <td className="px-4 py-3">{question.answer}</td>
                              <td className="px-4 py-3">
                                {question.correctAnswer}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                                    question.isCorrect
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {question.isCorrect ? "Correct" : "Incorrect"}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
