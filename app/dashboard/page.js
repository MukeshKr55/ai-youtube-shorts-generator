"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import EmptyState from "./_components/EmptyState";
import VideoList from "./_components/VideoList.jsx";
import Link from "next/link";
import { db } from "@/config/db";
import { VideoData } from "@/config/schema";
import { eq } from "drizzle-orm";
import { useUser } from "@clerk/nextjs";

function Dashboard() {
  const [videoList, setVideoList] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    user && getVideoList();
  }, [user]);

  const getVideoList = async () => {
    const result = await db
      .select()
      .from(VideoData)
      .where(eq(VideoData?.createdBy, user?.primaryEmailAddress?.emailAddress));

    setVideoList(result);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-2xl text-primary">Dashboard</h2>
        <Link href={"/dashboard/create-new"}>
          <Button>
            <span className="flex justify-center items-center gap-2">
              <PlusCircle size={20} /> Create New
            </span>
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      <div className="">
        {videoList?.length == 0 && (
          <div className="">
            <EmptyState />
          </div>
        )}

        {/* List of Videos */}
        <VideoList videoList={videoList} />
      </div>
    </div>
  );
}

export default Dashboard;
