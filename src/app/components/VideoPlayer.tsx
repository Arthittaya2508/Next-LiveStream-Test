import { useEffect, useRef, useState } from "react";
import Peer, { MediaConnection } from "peerjs";
import styles from "../asset/styles/VideoPlayer.module.scss";

const VideoPlayer: React.FC = () => {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [remotePeerId, setRemotePeerId] = useState<string>("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mic, setMic] = useState<boolean>(true);
  const [camera, setCamera] = useState<boolean>(true);
  const [callActive, setCallActive] = useState<boolean>(false);
  const [incomingCall, setIncomingCall] = useState<MediaConnection | null>(
    null
  );

  const myVideo = useRef<HTMLVideoElement | null>(null);
  const remoteVideo = useRef<HTMLVideoElement | null>(null);
  const peer = useRef<Peer | null>(null);
  const currentCall = useRef<MediaConnection | null>(null);

  const generatePeerId = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";

    const randomLetters = Array.from({ length: 4 }, () =>
      letters.charAt(Math.floor(Math.random() * letters.length))
    ).join("");

    const randomNumbers = Array.from({ length: 4 }, () =>
      numbers.charAt(Math.floor(Math.random() * numbers.length))
    ).join("");

    return `${randomLetters}-${randomNumbers}`;
  };

  useEffect(() => {
    const initPeer = () => {
      const customPeerId = generatePeerId();
      peer.current = new Peer(customPeerId);

      peer.current.on("open", (id: string) => setPeerId(id));

      peer.current.on("call", (call: MediaConnection) => {
        setIncomingCall(call);
      });
    };

    const getMediaStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        if (myVideo.current) {
          myVideo.current.srcObject = mediaStream;
          myVideo.current.style.transform = "scaleX(-1)";
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

  const acceptCall = () => {
    if (incomingCall && stream) {
      incomingCall.answer(stream);
      currentCall.current = incomingCall;
      setCallActive(true);
      setIncomingCall(null);

      incomingCall.on("stream", (remoteStream: MediaStream) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream;
        }
      });

      incomingCall.on("close", () => {
        endCall();
      });
    }
  };

  const declineCall = () => {
    if (incomingCall) {
      incomingCall.close();
      setIncomingCall(null);
    }
  };

  const callPeer = () => {
    if (!remotePeerId) {
      alert("Please enter a valid Peer ID");
      return;
    }
    if (!stream) {
      alert("Stream not ready!");
      return;
    }
    const call = peer.current?.call(remotePeerId, stream);
    if (call) {
      currentCall.current = call;
      setCallActive(true);

      call.on("stream", (remoteStream: MediaStream) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream;
        }
      });

      call.on("close", () => {
        endCall();
      });
    }
  };

  const endCall = () => {
    if (currentCall.current) {
      currentCall.current.close();
      currentCall.current = null;
    }
    setCallActive(false);
    if (remoteVideo.current) {
      remoteVideo.current.srcObject = null;
    }
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
      {!callActive ? (
        <button onClick={callPeer}>📞 Call</button>
      ) : (
        <button onClick={endCall}>❌ End Call</button>
      )}

      {incomingCall && (
        <div className={styles.incomingCall}>
          <p>Incoming call...</p>
          <button onClick={acceptCall}>✅ Accept</button>
          <button onClick={declineCall}>❌ Decline</button>
        </div>
      )}

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
