import { Button } from "@material-ui/core";
import { useState, useEffect, useRef, useContext } from "react";
import { SocketInstance } from "../UtilityComponents/ProtectedRoute";

const p2pConfig = { iceServers: [{ urls: "stun:stun1.l.google.com:19302" }] };

function MeetRoom({ match, User }) {
   const [roomName, setRoomName] = useState(null);
   const [verified, setVerified] = useState(false);

   const socket = useContext(SocketInstance);

   const videoRef = useRef();

   useEffect(() => {
      let abortFetch = new AbortController();
      async function verifyRoom() {
         try {
            let responseStream = await fetch(
               `/api/meet/verify-room?roomId=${match.params.roomId}`,
               { signal: abortFetch.signal }
            );

            if (abortFetch.signal.aborted) return;

            let response = await responseStream.json();

            if (response.status === "error") throw response.error;

            setRoomName(response.data);
            setVerified(true);
         } catch (error) {
            console.log(error);
         }
      }

      verifyRoom();

      return () => abortFetch.abort();
   }, [match.params.roomId]);

   useEffect(() => {
      socket.emit("join-meet-room", match.params.roomId);

      return () => socket.emit("leave-meet-room", match.params.roomId);
   }, [socket, match.params]);

   useEffect(() => {
      socket.on("call-offer", async offer => {
         console.log(offer);
         let peerConnection = new RTCPeerConnection(p2pConfig);

         let remoteStream = new MediaStream();

         let videoElement = document.createElement("video");
         videoElement.srcObject = remoteStream;
         videoRef.current.append(videoElement);
         videoElement.onloadedmetadata = () => videoElement.play();

         peerConnection.ontrack = ({ track }) => {
            console.log(track);
            remoteStream.addTrack(track);
         };

         await peerConnection.setRemoteDescription(
            new RTCSessionDescription(offer)
         );

         let answer = await peerConnection.createAnswer();

         await peerConnection.setLocalDescription(answer);
         socket.emit("call-answer", { answer, roomId: match.params.roomId });

         peerConnection.onicecandidate = ice => {
            if (ice.candidate)
               socket.emit("new-ice-candidate", {
                  iceCandidate: ice.candidate,
                  roomId: match.params.roomId,
               });
         };
         socket.on(
            "new-ice-candidate",
            async iceCandidate =>
               await peerConnection.addIceCandidate(iceCandidate)
         );
         peerConnection.onconnectionstatechange = event => {
            if (peerConnection.connectionState === "connected")
               console.log("Real-time connection to peer established!!!!!");
         };
      });

      return () => socket.off("call-offer");
   }, [socket, match.params]);

   async function initiateCall() {
      if (!verified) return;

      try {
         let stream = await new Promise((resolve, reject) => {
            window.navigator.getUserMedia(
               {
                  audio: true,
                  video: true,
               },
               stream => resolve(stream),
               error => reject(error)
            );
         });

         let videoElement = document.createElement("video");
         videoElement.srcObject = stream;
         videoElement.autoplay = true;

         videoRef.current.append(videoElement);

         let peerConnection = new RTCPeerConnection(p2pConfig);

         stream.getTracks().forEach(track => peerConnection.addTrack(track));

         socket.on("call-answer", async callAnswer => {
            console.log(callAnswer);
            await peerConnection.setRemoteDescription(
               new RTCSessionDescription(callAnswer)
            );
         });

         let offer = await peerConnection.createOffer();
         await peerConnection.setLocalDescription(offer);

         socket.emit("call-offer", { offer, roomId: match.params.roomId });

         peerConnection.onicecandidate = ice => {
            if (ice.candidate)
               socket.emit("new-ice-candidate", {
                  iceCandidate: ice.candidate,
                  roomId: match.params.roomId,
               });
         };

         socket.on(
            "new-ice-candidate",
            async iceCandidate =>
               await peerConnection.addIceCandidate(iceCandidate)
         );

         peerConnection.onconnectionstatechange = event => {
            if (peerConnection.connectionState === "connected")
               console.log("Real-time connection to peer established!!!!!");
         };
      } catch (error) {
         console.log(error);
      }
   }

   return (
      <div>
         <h2>{roomName}</h2>
         <Button variant="contained" color="primary" onClick={initiateCall}>
            Initiate Call
         </Button>
         <div ref={videoRef}></div>
      </div>
   );
}

export default MeetRoom;
