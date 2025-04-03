"use client";

import { useState, createContext } from "react";

const UserContext = createContext();

function UserProvider({ children }) {
  const [userData, setUserData] = useState({
    supervisor: "",
    tester: "",
    institution: "",
    faculty: "",
    department: "",
    speciality: "",
  });

  const updateUserData = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const setSupervisor = (value) => updateUserData("supervisor", value);
  const setTester = (value) => updateUserData("tester", value);
  const setInstitution = (value) => updateUserData("institution", value);
  const setFaculty = (value) => updateUserData("faculty", value);
  const setDepartment = (value) => updateUserData("department", value);
  const setSpeciality = (value) => updateUserData("speciality", value);

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
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export { UserProvider, UserContext };
