import AgoraRTM from "agora-rtm-sdk";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


const Home = () => {
    let APP_ID = import.meta.env.APP_ID;
  let token = null;
  let uid = String(Math.floor(Math.random() * 10000));

  const navigate = useNavigate();

  useEffect(() => {
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let roomId = urlParams.get("room");

    if (!roomId) {
      navigate('/lobby');
    }
  }, [navigate]);

  let client;
  let channel;

  let localStream;
  let remoteStream;
  let peerConnection;

  const servers = {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
  };

  let handleUserJoined = async (MemberId) => {
    console.log("A new user joined the channel", MemberId);
    await createOffer(MemberId);
  };
  //eslint-disable-next-line
  let handleUserLeft = async (MemberId) => {
    document.getElementById('user-2').style.display = 'none';
    document.getElementById('user-1').classList.remove("smallFrame");
  };

  let handleMessageFromPeer = async (message, MemberId) => {
    message = JSON.parse(message.text);

    if (message.type === "offer") {
      createAnswer(MemberId, message.offer);
    }
    if (message.type === "answer") {
      addAnswer(message.answer);
    }
    if (message.type === "candidate") {
      if (peerConnection) {
        peerConnection.addIceCandidate(message.candidate);
      }
    }
  };

  let constraints = {
    video: {
        width: {min: 640, ideal: 1920, max: 1920},
        height: {min: 480, ideal: 1080, max: 1080},
    },
    audio: true
  };

  let init = async () => {
    client = await AgoraRTM.createInstance(APP_ID);
    await client.login({ uid, token });

    channel = client.createChannel(roomId);
    await channel.join();

    channel.on("MemberJoined", handleUserJoined);
    channel.on("MemberLeft", handleUserLeft);
    client.on("MessageFromPeer", handleMessageFromPeer);

    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    document.getElementById("user-1").srcObject = localStream;
  };


  let createPeerConnection = async (MemberId) => {
    peerConnection = new RTCPeerConnection(servers);

    remoteStream = new MediaStream();
    document.getElementById("user-2").srcObject = remoteStream;
    document.getElementById("user-2").style.display = "block";
    document.getElementById("user-1").classList.add("smallFrame");

    if (!localStream) {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      document.getElementById("user-1").srcObject = localStream;
    }

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        client.sendMessageToPeer(
          {
            text: JSON.stringify({
              type: "candidate",
              candidate: event.candidate,
            }),
          },
          MemberId
        );
      }
    };
  }


  let createOffer = async (MemberId) => {

    await createPeerConnection(MemberId);

    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    client.sendMessageToPeer(
      { text: JSON.stringify({ type: "offer", offer: offer }) },
      MemberId
    );
  };

  let createAnswer = async (MemberId, offer) => {
    await createPeerConnection(MemberId);
    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    client.sendMessageToPeer(
      { text: JSON.stringify({ 'type': "answer", 'answer': answer }) },
      MemberId
    );
  }

  let addAnswer = async (answer) => {
    if (!peerConnection.currentRemoteDescription){
      peerConnection.setRemoteDescription(answer);
    }
  }

  let leaveChannel = async () => {
    await channel.leave();
    await client.logout();
  }

  let toggleCamera = async () => {
    let videoTrack = localStream.getTracks().find((track) => track.kind === "video");

    if (videoTrack.enabled) {
        videoTrack.enabled = false;
        document.getElementById("camera-btn").style.background = "rgb(255, 80, 80)";
    }else {
        videoTrack.enabled = true;
        document.getElementById("camera-btn").style.background = "rgb(179, 102, 249, .9)";
    }
  }

  let toggleMic = async () => {
    let audioTrack = localStream.getTracks().find((track) => track.kind === "audio");

    if (audioTrack.enabled) {
        audioTrack.enabled = false;
        document.getElementById("mic-btn").style.background = "rgb(255, 80, 80)";
    }else {
        audioTrack.enabled = true;
        document.getElementById("mic-btn").style.background = "rgb(179, 102, 249, .9)";
    }
  }

  window.addEventListener('beforeunload', leaveChannel);

  init();
  return (
    <>
      <div id="videos">
        <video className="video-player" id="user-1" autoPlay playsInline></video>
        <video className="video-player" id="user-2" autoPlay playsInline></video>
      </div>
      <div id="controls">
        <div className="control-container" id="camera-btn" onClick={toggleCamera}>
            <img src="camera.png" alt="camera" />
        </div>
        <div className="control-container" id="mic-btn" onClick={toggleMic}>
            <img src="mic.png" alt="camera" />
        </div>
        <a href="/lobby">
            <div className="control-container" id="leave-btn">
                <img src="phone.png" alt="camera" />
            </div>
        </a>
      </div>
    </>
  )
}

export default Home
