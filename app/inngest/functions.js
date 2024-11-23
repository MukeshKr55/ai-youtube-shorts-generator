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
      // Step 1: Generate Video Script
      const videoScriptResponse = await step.run(
        "Generate VideoScript",
        async () => {
          const prompt = `Generate a ${formData?.duration}-long video script on "${formData?.topic}" as a JSON array with:
          1. "contentText": A detailed narrative for each scene, dont use one line content.
          2. "imagePrompt": A detailed ${formData?.style} image description aligned with the scene. Use max only 3 imagePrompt for more than 30 sec duration and use 2 imagePrompt for 30 sec or less than 30sec duration`;

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

      // Step 2: Generate Audio
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

      // Step 3: Generate Captions
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

      // Step 4: Generate Images (Base64)
      const imagesBase64 = await step.run("Generate Images", async () => {
        const imagePromises = videoScriptResponse.map(async (scene) => {
          try {
            const apiUrl = getApiUrlByStyle(formData.style);
            const triggerWord = getTriggerWordByStyle(formData.style);

            console.log("GENERATING ---- ", scene.imagePrompt);

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

            const imageBase64 = Buffer.from(response.data, "binary").toString(
              "base64"
            );
            return `data:image/png;base64,${imageBase64}`;
          } catch (error) {
            console.error(
              "Image generation failed:",
              scene.imagePrompt,
              error.message
            );
            return null;
          }
        });

        return (await Promise.all(imagePromises)).filter((img) => img !== null);
      });

      // Step 5: Upload Images to Firebase
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
          return uploadResponse.data.downloadUrls;
        }
      );

      // Step 6: Update Database
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
      });

      // Step 7: Deduct User Credits
      await step.run("Update Credits", async () => {
        await db
          .update(Users)
          .set({ credits: userDetail.credits - 10 })
          .where(eq(Users.email, user?.primaryEmailAddress?.emailAddress));
      });

      return { status: "success", audio, captions, firebaseUrls };
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
