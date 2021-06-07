import { useState, useEffect, useRef, useContext } from "react";
import { makeStyles } from "@material-ui/core";
import { Button } from "@material-ui/core";
import ContentModal from "../UtilityComponents/ContentModal";
import { SocketInstance } from "../UtilityComponents/ProtectedRoute";

const useStyles = makeStyles({
   localVideo: {
      position: "absolute",
      bottom: "5px",
      right: "5px",
      height: "300px",
      width: "300px",
   },
});

const p2pConfig = { iceServers: [{ urls: "stun:stun1.l.google.com:19302" }] };

function MeetRoom({ match, User }) {
   const classes = useStyles();

   const [roomName, setRoomName] = useState(null);
   const [verified, setVerified] = useState(false);
   const [isRoomCreator, setIsRoomCreator] = useState(false);
   const [confirmRequired, setConfirmRequired] = useState(false);

   const socket = useContext(SocketInstance);

   const videoRef = useRef();
   const localVideoElementRef = useRef();

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

            setRoomName(response.data.roomName);

            if (User.UniqueUsername === response.data.creator) {
               setIsRoomCreator(true);
               setConfirmRequired(false);
            } else {
               setIsRoomCreator(false);
               setConfirmRequired(true);
            }

            setVerified(true);
         } catch (error) {
            console.log(error);
         }
      }

      verifyRoom();

      return () => abortFetch.abort();
   }, [match.params.roomId, User]);

   useEffect(() => {
      socket.emit("join-meet-room", match.params.roomId);

      return () => socket.emit("leave-meet-room", match.params.roomId);
   }, [socket, match.params]);

   useEffect(() => {
      if (!verified || !isRoomCreator) return;

      async function setUpRoom() {
         try {
            let localStream = await new Promise((resolve, reject) => {
               window.navigator.getUserMedia(
                  {
                     audio: true,
                     video: true,
                  },
                  stream => resolve(stream),
                  error => reject(error)
               );
            });

            localVideoElementRef.current.srcObject = localStream;

            localVideoElementRef.current.onloadedmetadata = () =>
               localVideoElementRef.current.play();

            let peerConnection = new RTCPeerConnection(p2pConfig);

            socket.on("call-offer", async offer => {
               let prevStreamId = null;
               peerConnection.ontrack = ({ streams: [remoteStream] }) => {
                  console.log(prevStreamId);
                  if (prevStreamId === remoteStream.id) return;

                  let remoteVideoElement = document.createElement("video");
                  remoteVideoElement.srcObject = remoteStream;
                  videoRef.current.append(remoteVideoElement);
                  remoteVideoElement.onloadedmetadata = () =>
                     remoteVideoElement.play();

                  prevStreamId = remoteStream.id;
               };

               localStream
                  .getTracks()
                  .forEach(track =>
                     peerConnection.addTrack(track, localStream)
                  );

               await peerConnection.setRemoteDescription(
                  new RTCSessionDescription(offer)
               );

               let answer = await peerConnection.createAnswer();

               await peerConnection.setLocalDescription(answer);
               socket.emit("call-answer", {
                  answer,
                  roomId: match.params.roomId,
               });

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
                     console.log(
                        "Real-time connection to peer established!!!!!"
                     );
               };
            });
         } catch (error) {
            console.log(error);
         }
      }

      setUpRoom();

      return () => socket.off("call-offer");
   }, [socket, match.params, isRoomCreator, verified]);

   async function joinCall() {
      if (!verified) return;

      try {
         let localStream = await new Promise((resolve, reject) => {
            window.navigator.getUserMedia(
               {
                  audio: true,
                  video: true,
               },
               stream => resolve(stream),
               error => reject(error)
            );
         });

         localVideoElementRef.current.srcObject = localStream;

         localVideoElementRef.current.onloadedmetadata = () =>
            localVideoElementRef.current.play();

         let peerConnection = new RTCPeerConnection(p2pConfig);

         localStream
            .getTracks()
            .forEach(track => peerConnection.addTrack(track, localStream));

         let prevStreamId = null;
         peerConnection.ontrack = ({ streams: [remoteStream] }) => {
            console.log(prevStreamId);
            if (prevStreamId === remoteStream.id) return;

            let remoteVideoElement = document.createElement("video");
            remoteVideoElement.srcObject = remoteStream;
            videoRef.current.append(remoteVideoElement);
            remoteVideoElement.onloadedmetadata = () =>
               remoteVideoElement.play();

            prevStreamId = remoteStream.id;
         };

         socket.on("call-answer", async callAnswer => {
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

   function closeConfirmModal() {
      setConfirmRequired(false);
   }

   return (
      <div>
         <h2>{roomName}</h2>
         <ContentModal
            isModalOpen={confirmRequired}
            handleModalClose={closeConfirmModal}
         >
            <Button variant="contained" color="primary" onClick={joinCall}>
               Join Call
            </Button>
         </ContentModal>
         <div ref={videoRef}></div>
         <video
            className={classes.localVideo}
            muted={true}
            ref={localVideoElementRef}
         ></video>
      </div>
   );
}

export default MeetRoom;
