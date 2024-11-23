import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { VideoData } from "@/config/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req, { params }) {
  const { taskId } = params;

  try {
    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Convert taskId to an integer to avoid type mismatches
    const numericTaskId = parseInt(taskId, 10);

    if (isNaN(numericTaskId)) {
      return NextResponse.json({ error: "Invalid Task ID" }, { status: 400 });
    }

    // Query the database for the task's status using the numeric task ID
    const taskData = await db
      .select({
        id: VideoData.id,
        status: VideoData.status,
        audioData: VideoData.audioData,
        caption: VideoData.caption,
        imageData: VideoData.imageData,
        script: VideoData.script,
      })
      .from(VideoData)
      .where(eq(VideoData.id, numericTaskId)) // Ensure the ID type matches
      .limit(1);

    if (!taskData || taskData.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Format the response
    const task = taskData[0];

    console.log("Task status:", task.status);

    const response = {
      id: task.id,
      status: task.status,
      result: {
        audioData: task.audioData,
        caption: task.caption,
        imageData: task.imageData,
        script: task.script,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching task status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
