"use client";

import React, { useEffect, useRef, useState } from "react";

export const VideoWithFallback = () => {
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoError) return;

    const playVideo = async () => {
      try {
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        await video.play();
      } catch (error) {
        console.error("Video autoplay failed:", error);
        setVideoError(true);
      }
    };

    const handleError = () => {
      setVideoError(true);
    };

    video.addEventListener("error", handleError);

    void playVideo();

    const handleInteraction = () => {
      void playVideo();
    };

    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      video.removeEventListener("error", handleError);
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, [videoError]);

  return (
    <div className="relative w-full max-w-[320px] md:max-w-[420px] my-6 display-flex">
      {!videoError ? (
        <video
          ref={videoRef}
          width={420}
          height={400}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/assets/egg_1.png"
          onError={() => {
            setVideoError(true);
          }}
          className="w-full"
          data-webkit-playsinline="true"
          data-x5-playsinline="true"
          data-x5-video-player-type="h5"
          data-x5-video-player-fullscreen="false"
          style={{
            height: 400,
            objectFit: "contain",
            background: "transparent",
            zIndex: -1,
          }}
        >
          <source src="/assets/egg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src="/assets/gifs/egg.gif"
          width={320}
          height={400}
          alt="Fabergé Egg"
          className="w-full h-auto max-w-[320px] md:max-w-[380px]"
        />
      )}
    </div>
  );
};
