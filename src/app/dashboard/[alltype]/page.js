import React from "react";
import fs from "fs/promises";
import path from "path";
import QuestionClient from "@/components/QuestionClient";

// Function to get random images for a specific cell type
async function getRandomImages(cellType, count = 20) {
  try {
    // Define paths for real and fake images
    // const realImagesDir = path.join(
    //   process.cwd(),
    //   "public",
    //   cellType.toLowerCase(),
    //   "real"
    // );
    // const fakeImagesDir = path.join(
    //   process.cwd(),
    //   "public",
    //   cellType.toLowerCase(),
    //   "fake"
    // );

    // Read directory contents
    // const realImages = await fs.readdir(realImagesDir);
    // const fakeImages = await fs.readdir(fakeImagesDir);

    const realImages = path.resolve(`../${cellType.toLowerCase()}/real`);
    const fakeImages = path.resolve(`..t/${cellType.toLowerCase()}/fake`);

    // Ensure we get exactly 10 real and 10 fake images
    // const realCount = Math.min(realImages.length, 10);
    // const fakeCount = Math.min(fakeImages.length, 10);

    // Randomly select images if we have more than needed
    let selectedRealImages = realImages;
    let selectedFakeImages = fakeImages;

    if (realImages.length > 10) {
      selectedRealImages = shuffleArray([...realImages]).slice(0, 10);
    }

    if (fakeImages.length > 10) {
      selectedFakeImages = shuffleArray([...fakeImages]).slice(0, 10);
    }

    // Create arrays with full paths and isReal flag
    const realImageData = selectedRealImages.map((img) => ({
      path: `../${cellType.toLowerCase()}/real/${img}`,
      isReal: true,
    }));

    const fakeImageData = selectedFakeImages.map((img) => ({
      path: `../${cellType.toLowerCase()}/fake/${img}`,
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
  const images = await getRandomImages(alltype.toLowerCase());

  // Serialize the data to pass to the client component
  const serializedImages = JSON.stringify(images);

  return (
    <QuestionClient cellType={alltype} serializedImages={serializedImages} />
  );
}
