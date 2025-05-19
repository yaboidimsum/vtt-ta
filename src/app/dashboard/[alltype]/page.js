import React from "react";
import fs from "fs/promises";
import path from "path";
import QuestionClient from "@/components/QuestionClient";

// Function to get predefined images for a specific cell type
async function getImages(cellType) {
  try {
    // Predefined image paths for each cell type
    const predefinedImagePaths = {
      L1: [
        "/L1/real/L1_dt_173.jpg",
        "/L1/real/L1_dt_97.jpg",
        "/L1/fake/seed0220.png",
        "/L1/fake/seed0702.png",
        "/L1/fake/seed0743.png",
        "/L1/fake/seed0336.png",
        "/L1/real/L1_dt_80.jpg",
        "/L1/fake/seed0420.png",
        "/L1/fake/seed0277.png",
        "/L1/fake/seed0689.png",
        "/L1/real/L1_dt_176.jpg",
        "/L1/real/L1_dt_166.jpg",
        "/L1/fake/seed0278.png",
        "/L1/real/L1_dt_180.jpg",
        "/L1/real/L1_dt_183.jpg",
        "/L1/fake/seed0323.png",
        "/L1/fake/seed0272.png",
        "/L1/fake/seed0471.png",
        "/L1/real/L1_dt_260.jpg",
        "/L1/real/L1_dt_5.jpg",
        "/L1/real/L1_dt_14.jpg",
        "/L1/fake/seed0249.png",
        "/L1/real/L1_dt_121.jpg",
        "/L1/fake/seed0338.png",
        "/L1/real/L1_dt_52.jpg",
        "/L1/fake/seed0173.png",
        "/L1/fake/seed0577.png",
        "/L1/real/L1_dt_175.jpg",
        "/L1/real/L1_dt_273.jpg",
        "/L1/fake/seed0180.png",
        "/L1/real/L1_dt_308.jpg",
        "/L1/fake/seed0699.png",
        "/L1/fake/seed0071.png",
        "/L1/real/L1_dt_152.jpg",
        "/L1/fake/seed0254.png",
        "/L1/real/L1_dt_25.jpg",
        "/L1/real/L1_dt_210.jpg",
        "/L1/real/L1_dt_234.jpg",
        "/L1/fake/seed0010.png",
        "/L1/fake/seed0498.png",
        "/L1/real/L1_dt_132.jpg",
        "/L1/real/L1_dt_77.jpg",
        "/L1/real/L1_dt_6.jpg",
        "/L1/fake/seed0644.png",
        "/L1/fake/seed0021.png",
        "/L1/real/L1_dt_13.jpg",
        "/L1/fake/seed0063.png",
        "/L1/real/L1_dt_58.jpg",
        "/L1/fake/seed0425.png",
        "/L1/real/L1_dt_294.jpg",
      ],
      L2: [
        "/L2/real/L2_dt_48.jpg",
        "/L2/fake/seed0076.png",
        "/L2/fake/seed0590.png",
        "/L2/fake/seed0623.png",
        "/L2/fake/seed0635.png",
        "/L2/real/L2_dt_9.jpg",
        "/L2/real/L2_dt_51.jpg",
        "/L2/real/L2_dt_63.jpg",
        "/L2/fake/seed0321.png",
        "/L2/real/L2_dt_74.jpg",
        "/L2/fake/seed0749.png",
        "/L2/fake/seed0428.png",
        "/L2/fake/seed0333.png",
        "/L2/real/L2_dt_65.jpg",
        "/L2/real/L2_dt_129.jpg",
        "/L2/fake/seed0737.png",
        "/L2/fake/seed0658.png",
        "/L2/real/L2_dt_171.jpg",
        "/L2/real/L2_dt_164.jpg",
        "/L2/fake/seed0173.png",
        "/L2/real/L2_dt_149.jpg",
        "/L2/fake/seed0140.png",
        "/L2/fake/seed0577.png",
        "/L2/fake/seed0560.png",
        "/L2/fake/seed0678.png",
        "/L2/real/L2_dt_76.jpg",
        "/L2/real/L2_dt_52.jpg",
        "/L2/fake/seed0237.png",
        "/L2/fake/seed0168.png",
        "/L2/fake/seed0608.png",
        "/L2/fake/seed0766.png",
        "/L2/fake/seed0184.png",
        "/L2/fake/seed0449.png",
        "/L2/real/L2_dt_42.jpg",
        "/L2/fake/seed0325.png",
        "/L2/real/L2_dt_94.jpg",
        "/L2/real/L2_dt_28.jpg",
        "/L2/fake/seed0664.png",
        "/L2/real/L2_dt_21.jpg",
        "/L2/fake/seed0361.png",
        "/L2/real/L2_dt_161.jpg",
        "/L2/real/L2_dt_26.jpg",
        "/L2/real/L2_dt_157.jpg",
        "/L2/real/L2_dt_123.jpg",
        "/L2/real/L2_dt_55.jpg",
        "/L2/real/L2_dt_160.jpg",
        "/L2/fake/seed0155.png",
        "/L2/real/L2_dt_115.jpg",
        "/L2/real/L2_dt_54.jpg",
        "/L2/real/L2_dt_10.jpg",
      ],
      L3: [
        "/L3/real/L3_dt_37.jpg",
        "/L3/real/L3_dt_87.jpg",
        "/L3/fake/seed0713.png",
        "/L3/fake/seed0812.png",
        "/L3/real/L3_dt_46.jpg",
        "/L3/fake/seed0006.png",
        "/L3/fake/seed0320.png",
        "/L3/fake/seed0400.png",
        "/L3/real/L3_dt_22.jpg",
        "/L3/real/L3_dt_112.jpg",
        "/L3/fake/seed0296.png",
        "/L3/fake/seed0741.png",
        "/L3/real/L3_dt_6.jpg",
        "/L3/real/L3_dt_38.jpg",
        "/L3/real/L3_dt_98.jpg",
        "/L3/fake/seed0460.png",
        "/L3/fake/seed0587.png",
        "/L3/real/L3_dt_81.jpg",
        "/L3/real/L3_dt_31.jpg",
        "/L3/real/L3_dt_118.jpg",
        "/L3/fake/seed0701.png",
        "/L3/fake/seed0426.png",
        "/L3/fake/seed0259.png",
        "/L3/fake/seed0689.png",
        "/L3/fake/seed0542.png",
        "/L3/real/L3_dt_12.jpg",
        "/L3/real/L3_dt_34.jpg",
        "/L3/fake/seed0804.png",
        "/L3/real/L3_dt_47.jpg",
        "/L3/real/L3_dt_111.jpg",
        "/L3/real/L3_dt_171.jpg",
        "/L3/real/L3_dt_177.jpg",
        "/L3/fake/seed0850.png",
        "/L3/fake/seed0845.png",
        "/L3/real/L3_dt_173.jpg",
        "/L3/fake/seed0545.png",
        "/L3/real/L3_dt_160.jpg",
        "/L3/fake/seed0642.png",
        "/L3/real/L3_dt_183.jpg",
        "/L3/fake/seed0722.png",
        "/L3/real/L3_dt_40.jpg",
        "/L3/real/L3_dt_15.jpg",
        "/L3/fake/seed0171.png",
        "/L3/real/L3_dt_165.jpg",
        "/L3/fake/seed0409.png",
        "/L3/fake/seed0752.png",
        "/L3/fake/seed0321.png",
        "/L3/real/L3_dt_66.jpg",
        "/L3/fake/seed0640.png",
        "/L3/real/L3_dt_143.jpg",
      ],
    };

    // Check if we have predefined paths for this cell type
    if (predefinedImagePaths[cellType]) {
      // Map the paths to objects with isReal flag
      return predefinedImagePaths[cellType].map((path) => ({
        path,
        isReal: path.includes("/real/"),
      }));
    }

    // Fallback to reading from filesystem if no predefined paths
    const realImagesDir = path.join(process.cwd(), "public", cellType, "real");
    const fakeImagesDir = path.join(process.cwd(), "public", cellType, "fake");

    const realImages = await fs.readdir(realImagesDir);
    const fakeImages = await fs.readdir(fakeImagesDir);

    let selectedRealImages = realImages;
    let selectedFakeImages = fakeImages;

    if (realImages.length > 25) {
      selectedRealImages = realImages.slice(0, 25);
    }

    if (fakeImages.length > 25) {
      selectedFakeImages = fakeImages.slice(0, 25);
    }

    const realImageData = selectedRealImages.map((img) => ({
      path: `/${cellType}/real/${img}`,
      isReal: true,
    }));

    const fakeImageData = selectedFakeImages.map((img) => ({
      path: `/${cellType}/fake/${img}`,
      isReal: false,
    }));

    const allImages = [...realImageData, ...fakeImageData];
    return allImages;
  } catch (error) {
    console.error("Error getting images:", error);

    // Return fallback data if there's an error
    return Array(50).fill({
      path: `/fallback-image.jpg`,
      isReal: Math.random() > 0.5,
    });
  }
}

export default async function Page({ params }) {
  const { alltype } = await params;

  // Get predefined images for this cell type
  const images = await getImages(alltype);

  // Serialize the data to pass to the client component
  const serializedImages = JSON.stringify(images);

  return (
    <QuestionClient cellType={alltype} serializedImages={serializedImages} />
  );
}
