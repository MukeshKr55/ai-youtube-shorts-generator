"use client";

import { useState, useContext } from "react";
import SelectTopic from "./_components/SelectTopic";
import SelectStyle from "./_components/SelectStyle";
import SelectVoice from "./_components/SelectVoice";
import SelectDuration from "./_components/SelectDuration";
import CustomLoading from "./_components/CustomLoading";
import { Button } from "@/components/ui/button";
import axios from "axios";
import PlayerDialog from "../_components/PlayerDialog";
import { VideoDataContext } from "@/app/_context/VideoDataContext";
import { UserDetailContext } from "@/app/_context/UserDetailContext";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

function CreateNew() {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [videoScript, setVideoScript] = useState(null);
  const [playVideo, setPlayVideo] = useState(false);
  const [videoId, setVideoId] = useState();
  const [polling, setPolling] = useState(false);

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
        toast("Not Enough Credits!");
        return;
      }

      setLoading(true);

      const { duration, topic, style, voice } = formData;
      if (!duration || !topic || !style || !voice) {
        toast("Please fill out all fields!");
        setLoading(false);
        return;
      }

      const prompt = `Generate a ${duration}-long video script on "${topic}" as a JSON array with:
        1. "contentText": A detailed narrative for each scene.
        2. "imagePrompt": A detailed ${style} image description aligned with the scene.`;

      const { data } = await axios.post("/api/get-video-script", { prompt });
      const videoScript = data.result;
      setVideoData({ videoScript });
      setVideoScript(videoScript);

      const response = await axios.post("/api/trigger-inngest", {
        formData,
        videoScript,
        user: user,
        userDetail,
      });

      toast("Video creation started!");
      console.log(response.data.id);
      pollTaskStatus(response.data.id);
    } catch (error) {
      console.error("Error generating video script:", error);
      toast("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const pollTaskStatus = async (taskId) => {
    setPolling(true);

    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get(`/api/stat/${taskId}`);
        console.log(`TaskId ${taskId}: `, data.status);
        if (data.status === "completed") {
          clearInterval(interval);
          setPolling(false);
          toast("Video creation completed!");
          setUserDetail((p) => ({ ...p, credits: userDetail?.credits - 10 }));
          setVideoData(data.result);
          setVideoId(taskId);
          setPlayVideo(true);
        } else if (data.status === "failed") {
          clearInterval(interval);
          setPolling(false);
          toast("Video creation failed. Please try again.");
        }
      } catch (error) {
        console.error("Error polling task status:", error);
      }
    }, 5000);
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
          disabled={loading || polling}
        >
          {loading ? "Generating..." : "Create Short Video"}
        </Button>
      </div>

      <CustomLoading loading={loading || polling} />

      {playVideo && <PlayerDialog playVideo={playVideo} videoId={videoId} />}
    </div>
  );
}

export default CreateNew;
