import { inngest } from "../../inngest/client";
import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { VideoData } from "@/config/schema";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json(); // Parse the request body for data

    const { formData, user, userDetail } = body;

    // Step 1: Create a new row with placeholders for NOT NULL fields
    const result = await db
      .insert(VideoData)
      .values({
        script: { script: "Video Script Placeholder" },
        audioData: "placeholder_audio.mp3", // Placeholder audio file name
        caption: { text: "Placeholder caption" }, // Placeholder caption
        imageData: ["placeholder_image_1.jpg", "placeholder_image_2.jpg"], // Placeholder image data
        createdBy:
          user?.primaryEmailAddress?.emailAddress || "unknown_user@example.com", // Fallback email
        status: "pending",
      })
      .returning({ id: VideoData.id });

    const id = result?.[0]?.id;

    if (!id) {
      throw new Error("Failed to create initial record in VideoData.");
    }

    // Step 2: Trigger Inngest function with the generated ID
    await inngest.send({
      name: "short.generate", // Must match the event name in your Inngest function
      data: { formData, id, user, userDetail }, // Pass the necessary data
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Error triggering Inngest function:", error);
    return NextResponse.json(
      {
        error: "Error triggering Inngest function",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
