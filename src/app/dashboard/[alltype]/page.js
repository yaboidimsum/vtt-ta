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

    // For L3, prioritize specific images
    if (cellType === "L3") {
      // Priority fake images for L3
      const priorityFakeImages = [
        "seed0640",
        "seed0850",
        "seed0259",
        "seed0296",
        "seed0542",
        "seed0701"
      ];
      
      // Priority real images for L3
      const priorityRealImages = [
        "L3_dt_15",
        "L3_dt_98",
        "L3_dt_66",
        "L3_dt_34",
        "L3_dt_40",
        "L3_dt_12"
      ];
      
      // Filter out priority images that actually exist in the directories
      const existingPriorityFake = priorityFakeImages
        .filter(img => fakeImages.some(file => file.startsWith(img)))
        .map(img => fakeImages.find(file => file.startsWith(img)));
      
      const existingPriorityReal = priorityRealImages
        .filter(img => realImages.some(file => file.startsWith(img)))
        .map(img => realImages.find(file => file.startsWith(img)));
      
      // Remove priority images from the original arrays to avoid repetition
      const remainingFakeImages = fakeImages.filter(img => 
        !existingPriorityFake.includes(img)
      );
      
      const remainingRealImages = realImages.filter(img => 
        !existingPriorityReal.includes(img)
      );
      
      // Randomly select the remaining images needed
      const additionalFakeCount = Math.max(0, 25 - existingPriorityFake.length);
      const additionalRealCount = Math.max(0, 25 - existingPriorityReal.length);
      
      let selectedRealImages = [
        ...existingPriorityReal,
        ...shuffleArray([...remainingRealImages]).slice(0, additionalRealCount)
      ];
      
      let selectedFakeImages = [
        ...existingPriorityFake,
        ...shuffleArray([...remainingFakeImages]).slice(0, additionalFakeCount)
      ];
      
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
      return shuffleArray(allImages);
    } 
    else {
      // Original logic for other cell types
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
      return shuffleArray(allImages);
    }
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
