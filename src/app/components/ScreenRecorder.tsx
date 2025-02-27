import { useState, useRef } from "react";

const ScreenRecorder: React.FC = () => {
  const [recording, setRecording] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      mediaRecorder.current = new MediaRecorder(stream);
      recordedChunks.current = [];

      mediaRecorder.current.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) recordedChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        setVideoUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting screen recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
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
