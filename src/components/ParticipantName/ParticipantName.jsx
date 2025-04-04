"use client";

import React from "react";
import { UserContext } from "@/provider/UserProvider";

function ParticipantName() {
  const { tester } = React.useContext(UserContext);

  return <>{tester}</>;
}

export default ParticipantName;
