import React from "react";
import path from "path";
import QuestionClient from "@/components/QuestionClient";

// Function to get random images for a specific cell type
function getRandomImages(cellType, count = 20) {
  try {
    // Generate arrays for real and fake images
    const realImagePaths = Array.from({ length: 10 }, (_, i) => ({
      path: `../${cellType.toLowerCase()}/real/image_${i + 1}.jpg`,
      isReal: true,
    }));

    const fakeImagePaths = Array.from({ length: 10 }, (_, i) => ({
      path: `../${cellType.toLowerCase()}/fake/image_${i + 1}.jpg`,
      isReal: false,
    }));

    // Combine all images
    const allImages = [...realImagePaths, ...fakeImagePaths];

    // Shuffle all images
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

export default function Page({ params }) {
  const { alltype } = params;

  // Get random images for this cell type
  const images = getRandomImages(alltype.toLowerCase());

  // Serialize the data to pass to the client component
  const serializedImages = JSON.stringify(images);

  return (
    <QuestionClient cellType={alltype} serializedImages={serializedImages} />
  );
}
