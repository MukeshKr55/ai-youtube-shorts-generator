import axios from "axios";
import { inngest } from "./client";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";
import { Users, VideoData } from "@/config/schema";

export const generateShort = inngest.createFunction(
  { id: "Generate Short Video" },
  {
    event: "short.generate", // Event trigger for Inngest
  },
  async ({ event, step }) => {
    const { formData, id, user, userDetail } = event.data;

    try {
      const prompt = `Generate a ${formData?.duration}-long video script on "${formData?.topic}" as a JSON array with:
        1. "contentText": A detailed narrative for each scene, dont use one line content.
        2. "imagePrompt": A detailed ${formData?.style} image description aligned with the scene. Use max only 3 imagePrompt for more than 30 sec duration and use 2 imagePrompt for 30 sec or less than 30sec duration`;

      const videoScriptResponse = await step.run(
        "Generate VideoScript",
        async () => {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/get-video-script`,
            JSON.stringify({ prompt }),
            { headers: { "Content-Type": "application/json" } }
          );
          if (!response?.data?.result) {
            throw new Error("Video script generation failed.");
          }
          return response.data.result;
        }
      );

      const audio = await step.run("Generate Audio", async () => {
        const audioResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/generate-audio`,
          {
            text: videoScriptResponse.map((item) => item.contentText).join(" "),
            id,
            voice: formData.voice,
          }
        );
        if (!audioResponse?.data?.result) {
          throw new Error("Audio generation failed.");
        }
        return audioResponse.data.result;
      });

      const captions = await step.run("Generate Captions", async () => {
        const captionResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/generate-caption`,
          { audioFileUrl: audio }
        );
        if (!captionResponse?.data?.result) {
          throw new Error("Caption generation failed.");
        }
        return captionResponse.data.result;
      });

      const images = await step.run("Generate Images", async () => {
        const allImages = [];

        for (const scene of videoScriptResponse) {
          try {
            const res = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/api/generate-image-primary`,
              {
                prompt: scene.imagePrompt,
                style: formData.style,
              }
            );

            if (res?.data?.downloadUrl) {
              allImages.push(res.data.downloadUrl);
            } else {
              console.warn(
                "Image generation failed for prompt:",
                scene.imagePrompt
              );
              allImages.push(null); // Add null for failed generations
            }
          } catch (error) {
            console.error("Error generating image for prompt:", error.message);
            allImages.push(null); // Add null in case of an error
          }
        }

        // Filter out any null values from failed generations
        return allImages.filter((img) => img !== null);
      });

      await step.run("Update Database", async () => {
        await db
          .update(VideoData)
          .set({
            script: videoScriptResponse,
            audioData: audio,
            caption: captions,
            imageData: images,
            status: "completed",
          })
          .where(eq(VideoData.id, id));
      });

      await step.run("Update Credits", async () => {
        await db
          .update(Users)
          .set({ credits: userDetail.credits - 10 })
          .where(eq(Users.email, user?.primaryEmailAddress?.emailAddress));
      });

      return { status: "success", audio, captions, images };
    } catch (error) {
      console.error("Error in Inngest generateShort function:", error);

      await step.run("Handle Failure", async () => {
        await db
          .update(VideoData)
          .set({ status: "failed" })
          .where(eq(VideoData.id, id));
      });

      throw error;
    }
  }
);
