"use client";

import { useState, createContext, useEffect, useRef } from "react";

const UserContext = createContext();

function UserProvider({ children }) {
  // Initialize with a complete structure to avoid undefined errors
  const [userData, setUserData] = useState({
    supervisor: "",
    tester: "",
    institution: "",
    faculty: "",
    department: "",
    speciality: "",
    // Test data structure for L1, L2, L3 classes
    testData: {
      L1: {
        currentQuestion: 0,
        answers: Array(20).fill(null), // User's answers (true=real, false=fake)
        correctAnswers: [], // Will be populated with actual correct answers
        imagePaths: [],
        comment: "",
        completed: false,
        startTime: null,
        endTime: null,
      },
      L2: {
        currentQuestion: 0,
        answers: Array(20).fill(null),
        correctAnswers: [],
        imagePaths: [],
        comment: "",
        completed: false,
        startTime: null,
        endTime: null,
      },
      L3: {
        currentQuestion: 0,
        answers: Array(20).fill(null),
        correctAnswers: [],
        imagePaths: [],
        comment: "",
        completed: false,
        startTime: null,
        endTime: null,
      },
    },
  });

  // Ref to track if localStorage has been loaded
  const isDataLoaded = useRef(false);
  // Ref to track if this is the first render for the second useEffect
  const isFirstRender = useRef(true);

  // Load data from localStorage on mount - only run once
  useEffect(() => {
    try {
      const savedData = window.localStorage.getItem("userData");

      if (savedData) {
        const parsedData = JSON.parse(savedData);

        // Ensure the testData structure is complete
        const completeData = {
          ...parsedData,
          testData: {
            L1: {
              currentQuestion: 0,
              answers: Array(20).fill(null),
              correctAnswers: [],
              imagePaths: [],
              comment: "",
              completed: false,
              startTime: null,
              endTime: null,
              ...(parsedData.testData?.L1 || {}),
            },
            L2: {
              currentQuestion: 0,
              answers: Array(20).fill(null),
              correctAnswers: [],
              imagePaths: [],
              comment: "",
              completed: false,
              startTime: null,
              endTime: null,
              ...(parsedData.testData?.L2 || {}),
            },
            L3: {
              currentQuestion: 0,
              answers: Array(20).fill(null),
              correctAnswers: [],
              imagePaths: [],
              comment: "",
              completed: false,
              startTime: null,
              endTime: null,
              ...(parsedData.testData?.L3 || {}),
            },
            ...(parsedData.testData || {}),
          },
        };

        setUserData(completeData);
      }

      // Mark data as loaded
      isDataLoaded.current = true;
    } catch (error) {
      console.error("Error loading user data from localStorage:", error);
      // Keep the default state if there's an error
      isDataLoaded.current = true;
    }
  }, []); // Empty dependency array - only run once on mount

  // Save to localStorage when userData changes (but only after initial load)
  useEffect(() => {
    // Skip if data hasn't been loaded yet
    if (!isDataLoaded.current) {
      return;
    }

    // Skip if userData is null
    if (!userData) {
      return;
    }

    // Use a timeout to debounce frequent updates
    const timeoutId = setTimeout(() => {
      window.localStorage.setItem("userData", JSON.stringify(userData));
    }, 300);

    // Cleanup timeout on unmount or before next effect run
    return () => clearTimeout(timeoutId);
  }, [userData]);

  const updateUserData = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const setSupervisor = (value) => updateUserData("supervisor", value);
  const setTester = (value) => updateUserData("tester", value);
  const setInstitution = (value) => updateUserData("institution", value);
  const setFaculty = (value) => updateUserData("faculty", value);
  const setDepartment = (value) => updateUserData("department", value);
  const setSpeciality = (value) => updateUserData("speciality", value);

  // Test-related functions
  const setCorrectAnswers = (cellType, correctAnswersArray) => {
    if (!userData) return;
    setUserData((prev) => ({
      ...prev,
      testData: {
        ...prev.testData,
        [cellType]: {
          ...prev.testData[cellType],
          correctAnswers: correctAnswersArray,
        },
      },
    }));
  };

  const recordAnswer = (cellType, questionIndex, answer) => {
    if (!userData) return;

    setUserData((prev) => {
      // Start the test timer if this is the first answer
      const startTime =
        prev.testData[cellType].startTime || new Date().toISOString();

      const newAnswers = [...prev.testData[cellType].answers];
      newAnswers[questionIndex] = answer;

      return {
        ...prev,
        testData: {
          ...prev.testData,
          [cellType]: {
            ...prev.testData[cellType],
            answers: newAnswers,
            currentQuestion: questionIndex + 1,
            startTime,
          },
        },
      };
    });
  };

  const saveComment = (cellType, comment) => {
    if (!userData) return;

    setUserData((prev) => ({
      ...prev,
      testData: {
        ...prev.testData,
        [cellType]: {
          ...prev.testData[cellType],
          comment,
        },
      },
    }));
  };

  const completeTest = (cellType) => {
    if (!userData) return;

    setUserData((prev) => ({
      ...prev,
      testData: {
        ...prev.testData,
        [cellType]: {
          ...prev.testData[cellType],
          completed: true,
          endTime: new Date().toISOString(),
        },
      },
    }));
  };

  const getTestResults = (cellType) => {
    if (!userData || !userData.testData || !userData.testData[cellType])
      return null;

    const testInfo = userData.testData[cellType];
    const { answers, correctAnswers } = testInfo;

    // Calculate correct answers
    let correctCount = 0;
    let answeredCount = 0;

    answers.forEach((answer, index) => {
      if (answer !== null) {
        answeredCount++;
        if (correctAnswers[index] === answer) {
          correctCount++;
        }
      }
    });

    return {
      totalQuestions: answers.length,
      answeredQuestions: answeredCount,
      correctAnswers: correctCount,
      accuracy: answeredCount > 0 ? (correctCount / answeredCount) * 100 : 0,
      progressPercentage: (answeredCount / answers.length) * 100,
      completed: testInfo.completed,
      startTime: testInfo.startTime,
      endTime: testInfo.endTime,
      comment: testInfo.comment,
    };
  };

  const exportAllResults = () => {
    if (!userData) return null;

    const {
      supervisor,
      tester,
      institution,
      faculty,
      department,
      speciality,
      testData,
    } = userData;

    return {
      testerInfo: {
        supervisor,
        tester,
        institution,
        faculty,
        department,
        speciality,
      },
      results: {
        L1: getTestResults("L1"),
        L2: getTestResults("L2"),
        L3: getTestResults("L3"),
      },
      rawData: testData,
    };
  };

  // Generate test data for a specific cell type
  const generateTestData = (
    cellType,
    externalImagePaths = null,
    externalCorrectAnswers = null
  ) => {
    if (!userData) return;

    // Check if we already have this data to prevent unnecessary updates
    if (
      userData.testData[cellType].imagePaths.length > 0 &&
      userData.testData[cellType].correctAnswers.length > 0
    ) {
      // If we already have data for this cell type, just return it
      return {
        imagePaths: userData.testData[cellType].imagePaths,
        correctAnswers: userData.testData[cellType].correctAnswers,
      };
    }

    try {
      let imagePaths, correctAnswers;

      if (externalImagePaths && externalCorrectAnswers) {
        // When using external data, randomly select 10 real and 10 fake images
        const realImages = externalImagePaths.filter((_, i) => externalCorrectAnswers[i]);
        const fakeImages = externalImagePaths.filter((_, i) => !externalCorrectAnswers[i]);

        // Randomly select 10 from each category
        const selectedReal = shuffleAndSelect(realImages, 10);
        const selectedFake = shuffleAndSelect(fakeImages, 10);

        // Combine and shuffle the final selection
        const allImages = [
          ...selectedReal.map(path => ({ path, isReal: true })),
          ...selectedFake.map(path => ({ path, isReal: false }))
        ];

        // Fisher-Yates shuffle for final order
        for (let i = allImages.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allImages[i], allImages[j]] = [allImages[j], allImages[i]];
        }

        // Extract paths and correct answers
        imagePaths = allImages.map(item => item.path);
        correctAnswers = allImages.map(item => item.isReal);
      } else {
        // Fallback behavior remains unchanged
        const realImages = Array(10)
          .fill(null)
          .map((_, i) => `/${cellType}/real/image_${i + 1}.jpg`);
        const fakeImages = Array(10)
          .fill(null)
          .map((_, i) => `/${cellType}/fake/image_${i + 1}.jpg`);

        const allImages = [
          ...realImages.map((path) => ({ path, isReal: true })),
          ...fakeImages.map((path) => ({ path, isReal: false })),
        ];

        // Fisher-Yates shuffle
        for (let i = allImages.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allImages[i], allImages[j]] = [allImages[j], allImages[i]];
        }

        imagePaths = allImages.map((item) => item.path);
        correctAnswers = allImages.map((item) => item.isReal);
      }

      // Update the state
      setUserData((prev) => ({
        ...prev,
        testData: {
          ...prev.testData,
          [cellType]: {
            ...prev.testData[cellType],
            imagePaths,
            correctAnswers,
            currentQuestion: 0,
            answers: Array(imagePaths.length).fill(null),
            startTime: prev.testData[cellType].startTime || new Date().toISOString(),
            endTime: null,
            completed: false,
            comment: "",
          },
        },
      }));

      return { imagePaths, correctAnswers };
    } catch (error) {
      console.error(`Error generating test data for ${cellType}:`, error);
      return null;
    }
  };

  // Helper function to shuffle and select n items from an array
  const shuffleAndSelect = (array, n) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, n);
  };

  // Reset all test data
  const resetAllTestData = () => {
    if (!userData) return;

    setUserData((prev) => ({
      supervisor: "",
      tester: "",
      institution: "",
      faculty: "",
      department: "",
      speciality: "",
      testData: {
        L1: {
          currentQuestion: 0,
          answers: Array(20).fill(null),
          correctAnswers: [],
          imagePaths: [],
          comment: "",
          completed: false,
          startTime: null,
          endTime: null,
        },
        L2: {
          currentQuestion: 0,
          answers: Array(20).fill(null),
          correctAnswers: [],
          imagePaths: [],
          comment: "",
          completed: false,
          startTime: null,
          endTime: null,
        },
        L3: {
          currentQuestion: 0,
          answers: Array(20).fill(null),
          correctAnswers: [],
          imagePaths: [],
          comment: "",
          completed: false,
          startTime: null,
          endTime: null,
        },
      },
    }));
  };

  // Get current question data
  const getCurrentQuestion = (cellType) => {
    if (!userData || !userData.testData || !userData.testData[cellType])
      return null;

    const { currentQuestion, imagePaths, answers } =
      userData.testData[cellType];

    if (!imagePaths || currentQuestion >= imagePaths.length) return null;

    return {
      questionNumber: currentQuestion + 1,
      totalQuestions: 20,
      imagePath: imagePaths[currentQuestion],
      answered: answers[currentQuestion] !== null,
      userAnswer: answers[currentQuestion],
      progress: (currentQuestion / 20) * 100,
    };
  };

  // Check if all questions are answered
  const areAllQuestionsAnswered = (cellType) => {
    if (!userData || !userData.testData || !userData.testData[cellType])
      return false;

    const { answers } = userData.testData[cellType];
    return answers.every((answer) => answer !== null);
  };

  return (
    <UserContext.Provider
      value={{
        ...userData,
        setSupervisor,
        setTester,
        setInstitution,
        setFaculty,
        setDepartment,
        setSpeciality,
        updateUserData,
        // Test functions
        setCorrectAnswers,
        recordAnswer,
        saveComment,
        completeTest,
        getTestResults,
        exportAllResults,
        // New functions
        generateTestData,
        resetAllTestData,
        getCurrentQuestion,
        areAllQuestionsAnswered,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export { UserProvider, UserContext };