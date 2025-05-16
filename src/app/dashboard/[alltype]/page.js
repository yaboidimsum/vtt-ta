import React from "react";
import fs from "fs/promises";
import path from "path";
import QuestionClient from "@/components/QuestionClient";

// Function to get random images for a specific cell type
async function getRandomImages(cellType, count = 50) {
  try {
    // Define paths for real and fake images
    const realImagesDir = path.join(process.cwd(), "public", cellType, "real");
    const fakeImagesDir = path.join(process.cwd(), "public", cellType, "fake");

    // Read directory contents
    const realImages = await fs.readdir(realImagesDir);
    const fakeImages = await fs.readdir(fakeImagesDir);

    // Ensure we get exactly 25 real and 25 fake images
    // const realCount = Math.min(realImages.length, 25);
    // const fakeCount = Math.min(fakeImages.length, 25);

    // Randomly select images if we have more than needed
    let selectedRealImages = realImages;
    let selectedFakeImages = fakeImages;

    if (realImages.length > 25) {
      selectedRealImages = shuffleArray([...realImages]).slice(0, 25);
    }

    if (fakeImages.length > 25) {
      selectedFakeImages = shuffleArray([...fakeImages]).slice(0, 25);
    }

    // Create arrays with full paths and isReal flag
    const realImageData = selectedRealImages.map((img) => ({
      path: `/${cellType}/real/${img}`,
      isReal: true,
    }));

    const fakeImageData = selectedFakeImages.map((img) => ({
      path: `/${cellType}/fake/${img}`,
      isReal: false,
    }));

    // Combine and shuffle
    const allImages = [...realImageData, ...fakeImageData];

    // Fisher-Yates shuffle algorithm
    return shuffleArray(allImages);
  } catch (error) {
    console.error("Error getting random images:", error);

    // Return fallback data if there's an error
    return Array(count).fill({
      path: `/fallback-image.jpg`,
      isReal: Math.random() > 0.5,
    });
  }
}

// Helper function to shuffle an array
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default async function Page({ params }) {
  const { alltype } = await params;

  // Get random images for this cell type
  const images = await getRandomImages(alltype);

  // Serialize the data to pass to the client component
  const serializedImages = JSON.stringify(images);

  return (
    <QuestionClient cellType={alltype} serializedImages={serializedImages} />
  );
}
