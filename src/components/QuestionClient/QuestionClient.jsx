"use client";

import React, { useState, useContext, useEffect } from "react";
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
import { useRouter } from "next/navigation";
import { UserContext } from "@/provider/UserProvider";

export default function QuestionClient({ cellType, serializedImages }) {
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [comment, setComment] = useState("");
  const [allAnswered, setAllAnswered] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Parse the serialized images
  useEffect(() => {
    try {
      if (serializedImages) {
        const parsedImages = JSON.parse(serializedImages);
        setImages(parsedImages);
        setAnswers(Array(parsedImages.length).fill(null));
      }
    } catch (error) {
      console.error("Error parsing images:", error);
    }
  }, [serializedImages]);

  // Get user context
  const userContext = useContext(UserContext);

  // Initialize test data in UserContext
  useEffect(() => {
    // Only proceed if we have images and the UserContext is available
    if (images.length > 0 && userContext && cellType) {
      try {
        // Extract paths and correct answers
        const imagePaths = images.map((img) => img.path);
        const correctAnswers = images.map((img) => img.isReal);

        // Initialize in UserContext if it has the generateTestData function
        if (typeof userContext.generateTestData === "function") {
          userContext.generateTestData(cellType, imagePaths, correctAnswers);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error initializing test data:", error);
      }
    }
  }, [images, userContext, cellType]);

  // Handle answer selection
  const handleAnswer = (isReal) => {
    // Update local state
    const newAnswers = [...answers];
    newAnswers[currentIndex] = isReal;
    setAnswers(newAnswers);

    // Record in UserContext if available
    if (
      isInitialized &&
      userContext &&
      typeof userContext.recordAnswer === "function"
    ) {
      userContext.recordAnswer(cellType, currentIndex, isReal);
    }

    // Move to next question or complete
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setAllAnswered(true);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = () => {
    if (isInitialized && userContext) {
      // Save comment and complete test if functions are available
      if (typeof userContext.saveComment === "function") {
        userContext.saveComment(cellType, comment);
      }

      if (typeof userContext.completeTest === "function") {
        userContext.completeTest(cellType);
      }
    }

    // Redirect to dashboard
    router.push("/dashboard");
  };

  const divStyle = `flex flex-col items-center justify-center gap-2 text-lg text-zinc-500`;

  // Show loading state if no images
  if (images.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading test data...</p>
      </div>
    );
  }

  const currentImage = images[currentIndex];
  const progress = ((currentIndex + 1) / images.length) * 100;

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-10">
      <div className="flex w-full items-center justify-around">
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
            <h2>{cellType} Cell Class</h2>
          </Badge>
        </div>
        <div className={`${divStyle} flex-1`}>
          <span>Question</span>
          <span>
            {currentIndex + 1}/{images.length}
          </span>
          <Progress value={progress} className="w-[30%]" />
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
      </div>

      {allAnswered ? (
        <div className="grid w-[50%] gap-1.5 px-10">
          <Label htmlFor="message" className={`text-lg`}>
            Berdasarkan {images.length} pertanyaan yang telah Anda jawab, Apa
            pendapat Anda mengenai kualitas asli dan palsu dari sel {cellType}?
          </Label>
          <div className="flex w-full flex-col gap-12">
            <Textarea
              className={`h-16`}
              placeholder="Type your message here."
              id="message"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button onClick={handleCommentSubmit} disabled={!comment.trim()}>
              Submit
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          <div className="rounded-lg ">
            <Image
              className="mx-auto mb-8 h-64 w-64 rounded-lg object-cover"
              alt={`${cellType} cell image`}
              src={currentImage.path}
              width={1024}
              height={1024}
              priority
              quality={1000}
              loader={({ src }) => src}
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-10">
            <span className="text-2xl">Is this cell image real or fake?</span>
            <div className="flex w-full justify-between">
              <Button
                className={`cursor-pointer bg-red-500 hover:bg-red-600`}
                onClick={() => handleAnswer(false)}
              >
                <X />
                Fake
              </Button>
              <Button
                className={`cursor-pointer bg-green-500 hover:bg-green-600`}
                onClick={() => handleAnswer(true)}
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
