"use client";

import { useContext } from "react";
import { UserContext } from "@/provider/UserProvider";
import { Button } from "@/components/ui/button";
import { Home, FileDown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function DialogThankyou() {
  const router = useRouter();

  const { tester, resetAllTestData, exportAllResults } =
    useContext(UserContext);

  const handleExport = () => {
    // if (isLoading) return;

    const results = exportAllResults();
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `vtt_results_${tester.replace(/\s+/g, "_")}.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Handle reset and redirect to landing page
  const handleReset = () => {
    // if (isLoading) return;

    // Reset all test data
    resetAllTestData();

    // Redirect to landing page
    router.push("/");
    toast.info("Profile has been reset");
  };

  return (
    <div className="flex gap-8">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" className={`cursor-pointer`}>
            <Home />
            Home
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              By clicking this button, you will be redirected to the landing and
              all your test data will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button onClick={handleExport} className={`cursor-pointer`}>
        <FileDown />
        Download Report
      </Button>
    </div>
  );
}

export default DialogThankyou;
