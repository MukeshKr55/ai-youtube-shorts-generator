import axios from "axios";
import { inngest } from "./client";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";
import { Users, VideoData } from "@/config/schema";
import { chatSession } from "@/config/AiModel";

export const generateShort = inngest.createFunction(
  { id: "Generate Short Video" },
  {
    event: "short.generate", // Event trigger for Inngest
  },
  async ({ event, step }) => {
    const { formData, id, user, userDetail } = event.data;

    try {
      console.log("[START] Generating short video process initiated.");

      // Step 1: Generate Video Script
      console.log("[INFO] Step 1: Generating video script...");
      const videoScriptResponse = await step.run(
        "Generate VideoScript",
        async () => {
          const prompt = `Generate a ${formData?.duration}-long video script on "${formData?.topic}" as a JSON array with:
          1. "contentText": A detailed narrative for each scene, don't use one-line content.
          2. "imagePrompt": A detailed ${formData?.style} image description aligned with the scene.`;

          const result = await chatSession.sendMessage(prompt);
          const rawResponse = await result.response.text();
          const sanitizedResponse = rawResponse
            .replace(/\/\/.*?(\n|$)/g, "") // Remove comments
            .replace(/[\r\n\t]/g, "") // Remove newlines and tabs
            .trim();
          console.log("[INFO] Video script generated successfully.");
          return JSON.parse(sanitizedResponse);
        }
      );

      // Parallel Tasks
      console.log(
        "[INFO] Starting parallel tasks for audio and image generation..."
      );
      const [audio, imagesBase64] = await Promise.all([
        // Step 2: Generate Audio
        step.run("Generate Audio", async () => {
          console.log("[INFO] Step 2: Generating audio...");
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
          console.log("[INFO] Audio generated successfully.");
          return audioResponse.data.result;
        }),

        // Step 4: Generate Images in Batches of 3
        step.run("Generate Images", async () => {
          console.log("[INFO] Step 4: Generating images in batches...");

          const batchSize = 3; // Limit per Hugging Face API
          const apiUrl = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev";
          const triggerWord = getTriggerWordByStyle(formData.style);

          const processBatch = async (batch) => {
            const batchPromises = batch.map(async (scene) => {
              try {
                const response = await axios.post(
                  apiUrl,
                  { inputs: `${triggerWord}, ${scene.imagePrompt}` },
                  {
                    headers: {
                      Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
                    },
                    responseType: "arraybuffer",
                  }
                );

                const imageBase64 = Buffer.from(
                  response.data,
                  "binary"
                ).toString("base64");
                console.log(
                  `[INFO] Image generated successfully for prompt: ${scene.imagePrompt}`
                );
                return `data:image/png;base64,${imageBase64}`;
              } catch (error) {
                console.error(
                  "[ERROR] Image generation failed:",
                  scene.imagePrompt,
                  error.message
                );
                return null; // Return null for failed images
              }
            });

            return Promise.all(batchPromises);
          };

          const batches = [];
          for (let i = 0; i < videoScriptResponse.length; i += batchSize) {
            batches.push(videoScriptResponse.slice(i, i + batchSize));
          }

          const generatedImages = [];
          for (const batch of batches) {
            const batchResults = await processBatch(batch);
            generatedImages.push(...batchResults);
          }

          const successfulImages = generatedImages.filter(
            (img) => img !== null
          );
          if (successfulImages.length !== videoScriptResponse.length) {
            throw new Error(
              `Image generation incomplete. Expected ${videoScriptResponse.length} images, but got ${successfulImages.length}.`
            );
          }

          console.log("[INFO] All images generated successfully in batches.");
          return successfulImages;
        }),
      ]);

      // Step 3: Generate Captions (depends on audio)
      console.log("[INFO] Step 3: Generating captions...");
      const captions = await step.run("Generate Captions", async () => {
        const captionResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/generate-caption`,
          { audioFileUrl: audio }
        );
        if (!captionResponse?.data?.result) {
          throw new Error("Caption generation failed.");
        }
        console.log("[INFO] Captions generated successfully.");
        return captionResponse.data.result;
      });

      // Step 5: Upload Images to Firebase (depends on images)
      console.log("[INFO] Step 5: Uploading images to Firebase...");
      const firebaseUrls = await step.run(
        "Upload Images to Firebase",
        async () => {
          const uploadResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/generate-image-primary`,
            { images: imagesBase64 },
            { headers: { "Content-Type": "application/json" } }
          );

          if (!uploadResponse?.data?.downloadUrls) {
            throw new Error("Firebase upload failed.");
          }
          console.log("[INFO] Images uploaded to Firebase successfully.");
          return uploadResponse.data.downloadUrls;
        }
      );

      // Step 6: Update Database
      console.log("[INFO] Step 6: Updating database...");
      await step.run("Update Database", async () => {
        await db
          .update(VideoData)
          .set({
            script: videoScriptResponse,
            audioData: audio,
            caption: captions,
            imageData: firebaseUrls,
            status: "completed",
          })
          .where(eq(VideoData.id, id));
        console.log("[INFO] Database updated successfully.");
      });

      // Step 7: Deduct User Credits
      console.log("[INFO] Step 7: Deducting user credits...");
      await step.run("Update Credits", async () => {
        await db
          .update(Users)
          .set({ credits: userDetail.credits - 10 })
          .where(eq(Users.email, user?.primaryEmailAddress?.emailAddress));
        console.log("[INFO] User credits updated successfully.");
      });

      console.log("[SUCCESS] Short video generation process completed.");
      return { status: "success", audio, captions, firebaseUrls };
    } catch (error) {
      console.error("[ERROR] Error in Inngest generateShort function:", error);

      await step.run("Handle Failure", async () => {
        await db
          .update(VideoData)
          .set({ status: "failed" })
          .where(eq(VideoData.id, id));
        console.log("[INFO] Failure status updated in the database.");
      });

      throw error;
    }
  }
);

// Helper Functions
function getApiUrlByStyle(style) {
  const styles = {
    Anime:
      "https://api-inference.huggingface.co/models/strangerzonehf/Flux-Animex-v2-LoRA",
    "Cartoon Mix":
      "https://api-inference.huggingface.co/models/prithivMLmods/Flux.1-Dev-Realtime-Toon-Mix",
    "Door Eye":
      "https://api-inference.huggingface.co/models/prithivMLmods/Flux.1-Dev-Pov-DoorEye-LoRA",
    Realistic:
      "https://api-inference.huggingface.co/models/prithivMLmods/Flux-Realism-FineDetailed",
    "Pixar 3D":
      "https://api-inference.huggingface.co/models/prithivMLmods/Canopus-Pixar-3D-Flux-LoRA",
    "Pencil Sketch":
      "https://api-inference.huggingface.co/models/prithivMLmods/Super-Pencil-Flux-LoRA",
    "Retro Pixel":
      "https://api-inference.huggingface.co/models/prithivMLmods/Retro-Pixel-Flux-LoRA",
    Abstract:
      "https://api-inference.huggingface.co/models/prithivMLmods/Abstract-Cartoon-Flux-LoRA",
  };
  return (
    styles[style] ||
    "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev"
  );
}

function getTriggerWordByStyle(style) {
  const triggers = {
    Anime: "Animex",
    "Cartoon Mix": "toon mix",
    "Door Eye": "look in 2",
    Realistic: "Fine Detailed",
    "Pixar 3D": "Pixar 3D",
    "Pencil Sketch": "Simple Pencil",
    "Retro Pixel": "Retro Pixel",
    Abstract: "Abstract",
  };
  return triggers[style] || "midjourney mix";
}
