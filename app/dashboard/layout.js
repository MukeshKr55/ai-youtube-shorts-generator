"use client";

import React, { useEffect, useState } from "react";
import Header from "./_components/Header.jsx";
import Sidebar from "./_components/Sidebar.jsx";
import { VideoDataContext } from "@/app/_context/VideoDataContext.jsx";
import { UserDetailContext } from "@/app/_context/UserDetailContext.jsx";
import { useUser } from "@clerk/nextjs";
import { db } from "@/config/db.js";
import { Users } from "@/config/schema.js";
import { eq } from "drizzle-orm";

function DashboardLayout({ children }) {
  const [videoData, setVideoData] = useState([]);
  const [userDetail, setUserDetail] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    user && getUserDetail();
  }, [user]);

  const getUserDetail = async () => {
    const result = await db
      .select()
      .from(Users)
      .where(eq(Users.email, user?.primaryEmailAddress?.emailAddress));

    setUserDetail(result[0]);
  };

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <VideoDataContext.Provider value={{ videoData, setVideoData }}>
        <div className="">
          <div className="hidden md:block h-screen bg-white fixed mt-[65px] w-64">
            <Sidebar />
          </div>
          <div>
            <Header />
            <div className="md:ml-64 p-10">{children}</div>
          </div>
        </div>
      </VideoDataContext.Provider>
    </UserDetailContext.Provider>
  );
}

export default DashboardLayout;
