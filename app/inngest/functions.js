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

    // Function to generate an image with retry mechanism
    const generateImageWithRetry = async (scene, index) => {
      const attemptImageGeneration = async () => {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/generate-image-primary`,
            {
              prompt: scene.imagePrompt, // Scene-specific image prompt
              style: formData.style, // Image style from form data
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
            // Retry for 500 or 503
            throw error;
          }

          // For other errors, fail gracefully without retry
          return { index, url: null };
        }
      };

      try {
        // First attempt
        return await attemptImageGeneration();
      } catch (error) {
        console.warn(
          `Retrying image generation for prompt: ${scene.imagePrompt}`
        );
        try {
          return await attemptImageGeneration(); // Retry once
        } catch (retryError) {
          console.error(
            `Retry failed for prompt: ${scene.imagePrompt}`,
            retryError.message
          );
          return { index, url: null }; // Return null for failed retries
        }
      }
    };

    try {
      const prompt = `Generate a ${formData?.duration}-long video script on "${formData?.topic}" as a JSON array with:
        1. "contentText": A detailed narrative for each scene.
        2. "imagePrompt": A detailed ${formData?.style} image description aligned with the scene.`;

      // Generate the Video Script
      const videoScriptResponse = await step.run(
        "Generate VideoScript",
        async () => {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/get-video-script`,
            JSON.stringify({
              prompt: prompt,
            }),
            {
              headers: {
                "Content-Type": "application/json",
              },
              maxRedirects: 0, // Disable automatic redirects
            }
          );

          if (!response?.data?.result) {
            throw new Error("Video script generation failed.");
          }
          return response.data.result; // Return the generated script
        }
      );

      // (Generate Audio) and (Generate Images) run in parallel
      const [audioUrl, images] = await Promise.all([
        // Step 1: Generate Audio (and proceed to generate captions)
        (async () => {
          const audio = await step.run(
            "Generate Audio",
            { timeout: "90s" },
            async () => {
              const audioResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/generate-audio`,
                {
                  text: videoScriptResponse
                    .map((item) => item.contentText)
                    .join(" "), // Concatenate all script content
                  id,
                  voice: formData.voice,
                }
              );

              if (!audioResponse?.data?.result) {
                throw new Error(
                  "Audio generation failed. Audio URL is undefined."
                );
              }
              return audioResponse.data.result;
            }
          );

          // Generate Captions after audio
          const captions = await step.run("Generate Captions", async () => {
            const captionResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/api/generate-caption`,
              {
                audioFileUrl: audio,
              }
            );

            if (!captionResponse?.data?.result) {
              throw new Error(
                "Caption generation failed. Captions are undefined."
              );
            }
            return captionResponse.data.result;
          });

          // Return both audio URL and captions
          return { audio, captions };
        })(),

        // Generate Images in parallel
        step.run(
          "Generate Images in Batches",
          { timeout: "500s" },
          async () => {
            const batchSize = 3; // Number of requests to send at a time
            const images = [];
            const batches = [];

            // Divide videoScript into batches
            for (let i = 0; i < videoScriptResponse.length; i += batchSize) {
              batches.push(videoScriptResponse.slice(i, i + batchSize));
            }

            // Process each batch sequentially
            for (const batch of batches) {
              const batchPromises = batch.map((scene) => {
                const index = videoScriptResponse.indexOf(scene); // Preserve global index
                return generateImageWithRetry(scene, index);
              });

              // Wait for all requests in the batch to complete
              const batchResults = await Promise.all(batchPromises);
              images.push(...batchResults);
            }

            // Sort images by index and return their URLs
            return images
              .sort((a, b) => a.index - b.index)
              .map((res) => res.url);
          }
        ),
      ]);

      const filteredImg = images.filter((img) => img !== null);
      const { audio, captions } = audioUrl; // Destructure from combined parallel promise

      // Update the Database
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
          .where(eq(id, VideoData?.id));
      });

      // Update User Credits
      await step.run("Update Credits", async () => {
        await db
          .update(Users)
          .set({ credits: userDetail.credits - 10 })
          .where(eq(Users?.email, user?.primaryEmailAddress?.emailAddress));
      });

      return { status: "success", audio, captions, images };
    } catch (error) {
      console.error("Error in Inngest generateShort function:", error);

      // Step to handle failure status
      await step.run("Handle Failure", async () => {
        await db
          .update(VideoData)
          .set({ status: "failed" })
          .where(eq(id, VideoData?.id));
      });

      throw error; // Re-throw error for retry mechanisms or debugging
    }
  }
);
