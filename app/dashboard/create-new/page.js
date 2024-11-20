"use client";

import { useContext, useEffect, useState } from "react";
import SelectTopic from "./_components/SelectTopic";
import SelectStyle from "./_components/SelectStyle";
import SelectVoice from "./_components/SelectVoice";
import SelectDuration from "./_components/SelectDuration";
import CustomLoading from "./_components/CustomLoading";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { VideoDataContext } from "@/app/_context/VideoDataContext";
import { UserDetailContext } from "@/app/_context/UserDetailContext";
import { Users, VideoData } from "@/config/schema";
import { useUser } from "@clerk/nextjs";
import { db } from "@/config/db";
import PlayerDialog from "../_components/PlayerDialog";
import { eq } from "drizzle-orm";
import { toast } from "sonner";

function CreateNew() {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [videoScript, setVideoScript] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [imageData, setImageData] = useState();
  const [playVideo, setPlayVideo] = useState(false);
  const [videoId, setVideoId] = useState();

  const { videoData, setVideoData } = useContext(VideoDataContext);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const { user } = useUser();

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (userDetail?.credits <= 0) {
        toast(`Not Enough Credits!`);
        return;
      }

      setLoading(true);

      const { duration, topic, style, voice } = formData;
      if (!duration || !topic || !style || !voice) {
        alert("Please fill out all fields!");
        setLoading(false);
        return;
      }

      const prompt = `Create a script for a video lasting exactly ${duration} on the topic: "${topic}". Ensure the output is a JSON array with the following fields for each scene:

      - "contentText": Provide a detailed and engaging narrative for each scene. Ensure the text is substantial, avoids one-liners, and logically fits into the specified duration. Divide the script into multiple scenes to create a cohesive and compelling flow. If the topic is specifically specified language other than English then do not include English words in contextText and if not specified choose default as English.
      
      - "imagePrompt": (The ImagePrompt always should be in English Language) Provide a highly detailed and ${style} style image description tailored to the contentText of each scene. Ensure that the image matches the context perfectly for example if talking about specif character like lord krishna it should something like this - A divine male figure with radiant blue skin, wearing a peacock feather crown adorned with intricate jewels. He has a serene and enchanting expression. Dressed in golden and royal blue traditional attire, he holds a flute delicately in one hand. His jewelry includes ornate necklaces, bangles, and anklets, enhancing his divine appearance. The figure is well-proportioned, exuding grace and charm, with a subtle glow surrounding him.
      
      ### Guidelines:
      1. **For Random or Mixed Topics** (e.g., fun facts, motivational quotes): Vary the image prompts across the array to reflect the unique nature of each scene. Do not maintain visual consistency unless the text context logically supports it.
         
      2. **For Cohesive Topics** (e.g., biographies, single-story arcs): Maintain image consistency across all scenes, ensuring recurring characters or visuals are described with the same traits, appearance, and attire for continuity.
      
      3. Avoid generic or overly brief descriptions for both fields. The contentText and imagePrompt must align precisely, ensuring meaningful and contextually accurate outputs.

      Return unique stories and prompts for each call, with no repetition across versions.`;

      // Step 1: Generate the video script
      const { data } = await axios.post("/api/get-video-script", { prompt });
      setVideoData((p) => ({
        ...p,
        videoScript: data.result,
      }));
      setVideoScript(data.result);

      // Step 2: Generate the audio file
      const audioUrl = await generateAudioFile(data.result);

      if (audioUrl) {
        // Step 3: Start both caption and image generation in parallel after audio generation
        const captionPromise = generateAudioCaption(audioUrl);
        const imagePromise = generateImage(data.result, formData.style);

        // Wait for both caption and image generation to complete
        await Promise.all([captionPromise, imagePromise]);
      } else {
        console.error(
          "Audio generation failed, skipping caption and image generation."
        );
      }
    } catch (error) {
      console.error("Error generating video script:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAudioFile = async (videoScriptData) => {
    let script = "";

    videoScriptData.forEach((item) => {
      script += item.contentText + " ";
    });
    const id = uuidv4();

    try {
      console.log(script);
      const { data } = await axios.post("/api/generate-audio", {
        text: script,
        id: id,
        voice: formData.voice,
      });

      const audioUrl = data.result;

      if (!audioUrl) {
        throw new Error("Audio generation failed, audio URL is undefined");
      }

      setVideoData((p) => ({
        ...p,
        audioData: data.result,
      }));
      setAudioData(audioUrl);
      return audioUrl;
    } catch (error) {
      console.error("Error generating audio:", error);
      return null;
    }
  };

  const generateAudioCaption = async (fileUrl) => {
    if (!fileUrl) {
      console.error(
        "Invalid file URL passed to generateAudioCaption:",
        fileUrl
      );
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("/api/generate-caption", {
        audioFileUrl: fileUrl,
      });
      setVideoData((p) => ({
        ...p,
        caption: data.result,
      }));
    } catch (error) {
      console.error("Error generating audio caption:", error);
      setLoading(false);
    }
  };

  const generateImage = async (videoScriptData, style) => {
    try {
      const chunkedData = [];
      for (let i = 0; i < videoScriptData.length; i += 3) {
        chunkedData.push(videoScriptData.slice(i, i + 3)); // Chunk data in groups of 3
      }

      const images = [];

      for (const chunk of chunkedData) {
        const results = await Promise.allSettled(
          chunk.map(async (scene) => {
            const res = await axios.post("/api/generate-image-primary", {
              prompt: scene.imagePrompt,
              style,
            });
            return res.data.downloadUrl;
          })
        );

        // Filter successful results and push to images array
        results.forEach((result) => {
          if (result.status === "fulfilled") {
            images.push(result.value);
          } else {
            console.error("Error generating imageeee:", result.reason);
          }
        });

        // Delay between batches to avoid API rate limiting
        console.log("Delay 3000ms");
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      console.log("Generated Images:", images);
      setVideoData((p) => ({
        ...p,
        imageData: images,
      }));
      setImageData(images);
    } catch (error) {
      console.error("Error generating images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoData && Object.keys(videoData).length === 4) {
      saveVideoData(videoData);
    }
  }, [videoData]);

  const saveVideoData = async (videoData) => {
    setLoading(true);

    const result = await db
      .insert(VideoData)
      .values({
        script: videoData?.videoScript,
        audioData: videoData?.audioData,
        caption: videoData?.caption,
        imageData: videoData?.imageData,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      })
      .returning({ id: VideoData?.id });

    setVideoId(result[0].id);
    await updateUserCredits();
    setPlayVideo(true);
    setLoading(false);
  };

  const updateUserCredits = async () => {
    const result = await db
      .update(Users)
      .set({ credits: userDetail.credits - 10 })
      .where(eq(Users?.email, user?.primaryEmailAddress?.emailAddress));
    setUserDetail((p) => ({ ...p, credits: userDetail?.credits - 10 }));
    setVideoData(null);
  };

  return (
    <div className="md:px-20">
      <h2 className="font-bold text-4xl text-primary text-center">
        Create New
      </h2>
      <div className="mt-10 shadow-md p-10">
        <SelectTopic onUserSelect={handleInputChange} />
        <SelectStyle onUserSelect={handleInputChange} />
        <SelectVoice onUserSelect={handleInputChange} />
        <SelectDuration onUserSelect={handleInputChange} />
        <Button
          className="mt-10 w-full"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Generating..." : "Create Short Video"}
        </Button>
      </div>

      <CustomLoading loading={loading} />

      {playVideo && <PlayerDialog playVideo={playVideo} videoId={videoId} />}
    </div>
  );
}

export default CreateNew;
