"use client";
import VideoPlayer from "./components/VideoPlayer";
import ScreenRecorder from "./components/ScreenRecorder";

export default function Home() {
  return (
    <div>
      <h1>Live Streaming + Screen Recording Kub </h1>
      <VideoPlayer />
      <ScreenRecorder />
    </div>
  );
}
