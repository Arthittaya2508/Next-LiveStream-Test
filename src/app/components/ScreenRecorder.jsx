import { useState, useRef } from "react";

const ScreenRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const mediaRecorder = useRef(null);
  const recordedChunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    mediaRecorder.current = new MediaRecorder(stream);

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunks.current.push(event.data);
    };

    mediaRecorder.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: "video/webm" });
      setVideoUrl(URL.createObjectURL(blob));
    };

    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    setRecording(false);
  };

  return (
    <div>
      {recording ? (
        <button onClick={stopRecording}>🛑 Stop Recording</button>
      ) : (
        <button onClick={startRecording}>📹 Start Recording</button>
      )}
      {videoUrl && <video src={videoUrl} controls />}
    </div>
  );
};

export default ScreenRecorder;
