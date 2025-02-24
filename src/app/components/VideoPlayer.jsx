import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import styles from "../components/VideoPlayer.module.scss";

const VideoPlayer = () => {
  const [peerId, setPeerId] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState("");
  const [stream, setStream] = useState(null);
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peer = useRef(null);

  useEffect(() => {
    const initPeer = async () => {
      peer.current = new Peer();

      peer.current.on("open", (id) => setPeerId(id));

      peer.current.on("call", (call) => {
        if (stream) {
          call.answer(stream);
          call.on("stream", (remoteStream) => {
            if (remoteVideo.current) {
              remoteVideo.current.srcObject = remoteStream;
            }
          });
        } else {
          console.warn("Stream not ready when receiving a call!");
        }
      });
    };

    const getMediaStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true, // ตรวจสอบว่าไมค์เปิดให้ใช้งาน
        });
        setStream(mediaStream);
        if (myVideo.current) {
          myVideo.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("Failed to access media devices:", error);
      }
    };

    getMediaStream();
    initPeer();

    return () => {
      if (peer.current) peer.current.destroy();
    };
  }, []);

  useEffect(() => {
    if (peer.current && stream) {
      peer.current.on("call", (call) => {
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          if (remoteVideo.current) {
            remoteVideo.current.srcObject = remoteStream;
          }
        });
      });
    }
  }, [stream]); // รีเรนเดอร์ใหม่เมื่อ stream พร้อมใช้งาน

  const callPeer = () => {
    if (!remotePeerId) {
      alert("Please enter a valid Peer ID");
      return;
    }
    if (!stream) {
      alert("Stream not ready!");
      return;
    }
    const call = peer.current.call(remotePeerId, stream);
    call.on("stream", (remoteStream) => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = remoteStream;
      }
    });
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !mic;
      });
      setMic(!mic);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !camera;
      });
      setCamera(!camera);
    }
  };

  return (
    <div className={styles.videoContainer}>
      <h2>Your Peer ID:</h2>
      <p>{peerId}</p>

      <h3>Enter Peer ID to call:</h3>
      <input
        type="text"
        value={remotePeerId}
        onChange={(e) => setRemotePeerId(e.target.value)}
        placeholder="Enter Peer ID"
      />
      <button onClick={callPeer}>📞 Call</button>

      <div className={styles.videoWrapper}>
        <video ref={myVideo} autoPlay playsInline muted></video>
        <video ref={remoteVideo} autoPlay playsInline></video>
      </div>

      <button onClick={toggleMic}>{mic ? "🔊 Mic ON" : "🔇 Mic OFF"}</button>
      <button onClick={toggleCamera}>
        {camera ? "📷 Camera ON" : "🚫 Camera OFF"}
      </button>
    </div>
  );
};

export default VideoPlayer;
