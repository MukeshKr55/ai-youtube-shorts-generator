import React, { useState, useEffect } from "react";
import { Thumbnail } from "@remotion/player";
import RemotionVideo from "./RemotionVideo";
import PlayerDialog from "./PlayerDialog";

function VideoList({ videoList }) {
  const [openPlayDialog, setOpenPlayDialog] = useState(false);
  const [videoId, setVideoId] = useState();
  const [dimensions, setDimensions] = useState({ width: 200, height: 350 });

  useEffect(() => {
    // Function to adjust dimensions based on device width
    const updateDimensions = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) {
        // Small devices
        setDimensions({ width: 150, height: 250 });
      } else if (screenWidth < 1024) {
        // Medium devices
        setDimensions({ width: 180, height: 300 });
      } else {
        // Large devices
        setDimensions({ width: 200, height: 350 });
      }
    };

    // Initial call
    updateDimensions();

    // Add resize event listener
    window.addEventListener("resize", updateDimensions);

    // Cleanup listener on component unmount
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div className="flex justify-center">
      <div className="mt-10 flex justify-start flex-wrap gap-6">
        {videoList?.map((video, idx) => (
          <div
            onClick={() => {
              setOpenPlayDialog(Date.now());
              setVideoId(video?.id);
            }}
            className="cursor-pointer hover:scale-105 transition-all"
            key={idx}
          >
            <Thumbnail
              className="rounded-xl"
              component={RemotionVideo}
              compositionWidth={dimensions.width}
              compositionHeight={dimensions.height}
              frameToDisplay={30}
              durationInFrames={120}
              fps={30}
              inputProps={{
                ...video,
                setDurationInFrame: (v) => console.log(v),
              }}
            />
          </div>
        ))}
        {openPlayDialog && (
          <PlayerDialog playVideo={openPlayDialog} videoId={videoId} />
        )}
      </div>
    </div>
  );
}

export default VideoList;
