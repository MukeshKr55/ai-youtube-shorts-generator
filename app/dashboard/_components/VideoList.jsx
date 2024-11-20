import React, { useState } from "react";
import { Thumbnail } from "@remotion/player";
import RemotionVideo from "./RemotionVideo";
import PlayerDialog from "./PlayerDialog";

function VideoList({ videoList }) {
  const [openPlayDialog, setOpenPlayDialog] = useState(false);
  const [videoId, setVideoId] = useState();

  return (
    <div className="flex justify-center">
      <div className="mt-10 flex justify-start flex-wrap gap-6 ">
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
              compositionWidth={200}
              compositionHeight={350}
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
