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

    const retryWithDelay = async (fn, retries = 2, delay = 1000) => {
      try {
        return await fn();
      } catch (error) {
        if (retries <= 0) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return retryWithDelay(fn, retries - 1, delay);
      }
    };

    const generateImageWithRetry = async (scene, index) => {
      const attemptImageGeneration = async () => {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/generate-image-primary`,
            {
              prompt: scene.imagePrompt,
              style: formData.style,
            }
          );
          return { index, url: response?.data?.downloadUrl || null };
        } catch (error) {
          const status = error.response?.status || 0;
          console.error(
            `Error generating image for prompt: ${scene.imagePrompt} (status: ${status})`,
            error.message
          );
          if (status === 500 || status === 503) {
            throw error;
          }
          return { index, url: null };
        }
      };

      try {
        return await attemptImageGeneration();
      } catch (error) {
        console.warn(
          `Retrying image generation for prompt: ${scene.imagePrompt}`
        );
        try {
          return await attemptImageGeneration();
        } catch (retryError) {
          console.error(
            `Retry failed for prompt: ${scene.imagePrompt}`,
            retryError.message
          );
          return { index, url: null };
        }
      }
    };

    try {
      const prompt = `Generate a ${formData?.duration}-long video script on "${formData?.topic}" as a JSON array with:
        1. "contentText": A detailed narrative for each scene.
        2. "imagePrompt": A detailed ${formData?.style} image description aligned with the scene.`;

      const videoScriptResponse = await step.run("Generate VideoScript", () =>
        retryWithDelay(async () => {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/get-video-script`,
            JSON.stringify({ prompt }),
            {
              headers: { "Content-Type": "application/json" },
              maxRedirects: 0,
            }
          );
          if (!response?.data?.result) {
            throw new Error("Video script generation failed.");
          }
          return response.data.result;
        })
      );

      const audio = await step.run("Generate Audio", () =>
        retryWithDelay(async () => {
          const audioResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/generate-audio`,
            {
              text: videoScriptResponse
                .map((item) => item.contentText)
                .join(" "),
              id,
              voice: formData.voice,
            }
          );
          if (!audioResponse?.data?.result) {
            throw new Error("Audio generation failed.");
          }
          return audioResponse.data.result;
        })
      );

      const captions = await step.run("Generate Captions", () =>
        retryWithDelay(async () => {
          const captionResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/generate-caption`,
            { audioFileUrl: audio }
          );
          if (!captionResponse?.data?.result) {
            throw new Error("Caption generation failed.");
          }
          return captionResponse.data.result;
        })
      );

      const images = await step.run("Generate Images in Batches", async () => {
        const batchSize = 3;
        const images = [];
        const batches = [];

        for (let i = 0; i < videoScriptResponse.length; i += batchSize) {
          batches.push(videoScriptResponse.slice(i, i + batchSize));
        }

        for (const [i, batch] of batches.entries()) {
          const batchPromises = batch.map((scene, idx) => {
            const globalIndex = i * batchSize + idx;
            return generateImageWithRetry(scene, globalIndex);
          });

          const batchResults = await Promise.all(batchPromises);
          images.push(...batchResults);
        }

        return images.sort((a, b) => a.index - b.index).map((res) => res.url);
      });

      const filteredImg = images.filter((img) => img !== null);

      await step.run("Update Database", async () => {
        await db
          .update(VideoData)
          .set({
            script: videoScriptResponse,
            audioData: audio,
            caption: captions,
            imageData: filteredImg,
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
