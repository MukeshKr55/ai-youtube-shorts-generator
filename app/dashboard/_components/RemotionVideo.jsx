import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

function RemotionVideo({
  script,
  audioData,
  caption,
  imageData,
  setDurationInFrame,
}) {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const getDurationFrame = () => {
    setDurationInFrame((caption[caption?.length - 1]?.end / 950) * fps);
    return (caption[caption?.length - 1]?.end / 950) * fps;
  };

  const getCurrentCaptions = () => {
    const currTime = (frame / 30) * 1000; // convert frame to ms 30fps
    const currCaption = caption.find(
      (word) => currTime >= word.start && currTime <= word.end
    );
    return currCaption ? currCaption?.text : "";
  };

  return (
    <AbsoluteFill className="bg-white">
      {imageData?.map((item, idx) => {
        const startTime = (idx * getDurationFrame()) / imageData?.length;
        const duration = getDurationFrame();

        const scale = (idx) =>
          interpolate(
            frame,
            [startTime, startTime + duration / 2, startTime + duration],
            idx % 2 === 0 ? [1, 1.5, 1] : [1.5, 1, 1.5],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

        return (
          <>
            <Sequence
              key={idx}
              from={startTime}
              durationInFrames={getDurationFrame()}
            >
              <Img
                src={item}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `scale(${scale(idx)})`,
                }}
              />
              <AbsoluteFill
                style={{
                  color: "white",
                  justifyContent: "center",
                  top: undefined,
                  bottom: 10,
                  height: 150,
                  textAlign: "center",
                  width: "100%",
                }}
              >
                <h2 className="text-2xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                  {getCurrentCaptions()}
                </h2>
              </AbsoluteFill>
            </Sequence>
          </>
        );
      })}
      <Audio src={`${audioData}`} />
    </AbsoluteFill>
  );
}

export default RemotionVideo;
