import { useState, useEffect, useRef, useContext } from "react";
import { makeStyles } from "@material-ui/core";
import { Button } from "@material-ui/core";
import { SocketInstance } from "../UtilityComponents/ProtectedRoute";
import { GlobalActionStatus } from "../App";
import ContentModal from "../UtilityComponents/ContentModal";
import CenteredLoader from "../UtilityComponents/CenteredLoader";

const useStyles = makeStyles({
   roomContainer: {
      marginTop: navHeight => navHeight,
   },
   localVideo: {
      position: "absolute",
      bottom: "5px",
      right: "5px",
      height: "200px",
      width: "200px",
   },
   streamsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gridAutoRows: "300px",
      gap: "20px",
      "& video": {
         width: "100%",
         height: "100%",
      },
   },
   joinRoom: {
      position: "relative",
   },
});

const p2pConfig = { iceServers: [{ urls: "stun:stun1.l.google.com:19302" }] };

function MeetRoom({ match, User, navHeight }) {
   const classes = useStyles(navHeight);

   const [roomName, setRoomName] = useState(null);
   const [verified, setVerified] = useState(false);
   const [confirmRequired, setConfirmRequired] = useState(true);
   const [isLoading, setIsLoading] = useState(false);

   const socket = useContext(SocketInstance);
   const setActionStatus = useContext(GlobalActionStatus);

   const videoRef = useRef();
   const localStreamRef = useRef();
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

      return () =>
         socket.emit(
            "leave-meet-room",
            match.params.roomId,
            User.UniqueUsername
         );
   }, [socket, match.params, User]);

   useEffect(() => {
      return () => {
         socket.off(`call-offer-${User.UniqueUsername}`);
         socket.off("new-peer");
         localStreamRef.current &&
            localStreamRef.current.getTracks().forEach(track => track.stop());
      };
   }, [socket, User.UniqueUsername]);

   function initiateCall() {
      if (!verified) return;

      socket.emit("new-peer-joined", {
         peerName: User.UniqueUsername,
         roomId: match.params.roomId,
      });

      setConfirmRequired(false);
   }

   async function setUpCallReception() {
      if (!verified) return;

      try {
         let localStream = localStreamRef.current;

         localVideoElementRef.current.srcObject = localStream;
         localVideoElementRef.current.onloadedmetadata = () =>
            localVideoElementRef.current.play();

         socket.on(
            `call-offer-${User.UniqueUsername}`,
            async (offer, callerName) => {
               try {
                  let peerConnection = new RTCPeerConnection(p2pConfig);

                  localStream
                     .getTracks()
                     .forEach(track =>
                        peerConnection.addTrack(track, localStream)
                     );

                  let prevStreamId = null;
                  peerConnection.ontrack = ({ streams: [remoteStream] }) => {
                     if (prevStreamId === remoteStream.id) return;

                     let remoteVideoElement = document.createElement("video");
                     remoteVideoElement.srcObject = remoteStream;
                     videoRef.current.append(remoteVideoElement);
                     remoteVideoElement.onloadedmetadata = () =>
                        remoteVideoElement.play();

                     peerConnection.onconnectionstatechange = () => {
                        if (peerConnection.connectionState === "failed") {
                           console.log(`Connection severed with ${callerName}`);
                           remoteVideoElement.remove();
                           socket.off(`peer-${callerName}-left`);
                        }
                     };

                     socket.on(`peer-${callerName}-left`, () => {
                        remoteVideoElement.remove();
                        socket.off(`peer-${callerName}-left`);
                     });

                     prevStreamId = remoteStream.id;
                  };

                  await peerConnection.setRemoteDescription(
                     new RTCSessionDescription(offer)
                  );

                  let answer = await peerConnection.createAnswer();

                  await peerConnection.setLocalDescription(answer);
                  socket.emit("call-answer-specific-peer", {
                     answer,
                     roomId: match.params.roomId,
                     userName: User.UniqueUsername,
                     callerName,
                  });

                  function iceCandidateListener(ice) {
                     if (ice.candidate)
                        socket.emit("new-ice-candidate-for-specific-peer", {
                           iceCandidate: ice.candidate,
                           roomId: match.params.roomId,
                           peerName: User.UniqueUsername,
                           callerName,
                        });
                  }

                  peerConnection.onicecandidate = iceCandidateListener;
                  socket.on(
                     `new-ice-candidate-${User.UniqueUsername}-${callerName}`,
                     async iceCandidate => {
                        try {
                           await peerConnection.addIceCandidate(iceCandidate);
                        } catch (error) {
                           console.log(error);
                        }
                     }
                  );
                  peerConnection.onconnectionstatechange = event => {
                     if (peerConnection.connectionState === "connected") {
                        socket.off(
                           `call-answer-${User.UniqueUsername}-${callerName}`
                        );
                        socket.off(
                           `new-ice-candidate-${User.UniqueUsername}-${callerName}`
                        );
                        peerConnection.removeEventListener(
                           "icecandidate",
                           iceCandidateListener
                        );
                        console.log(
                           "Real-time connection to peer established!!!!!"
                        );
                     }
                  };
               } catch (error) {
                  console.log();
               }
            }
         );
      } catch (error) {
         console.log(error);
         return new Error(error);
      }
   }

   async function initializeMeetRoom() {
      if (!verified) return;

      setIsLoading(true);
      try {
         let localStream = await window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
         });
         localStreamRef.current = localStream;

         socket.on("new-peer", async peerName => {
            console.log("new peer");
            if (peerName === User.UniqueUsername) return;

            try {
               let peerConnection = new RTCPeerConnection(p2pConfig);

               localStream
                  .getTracks()
                  .forEach(track =>
                     peerConnection.addTrack(track, localStream)
                  );

               let prevStreamId = null;
               peerConnection.ontrack = ({ streams: [remoteStream] }) => {
                  if (prevStreamId === remoteStream.id) return;

                  let remoteVideoElement = document.createElement("video");
                  remoteVideoElement.srcObject = remoteStream;
                  videoRef.current.append(remoteVideoElement);

                  remoteVideoElement.onloadedmetadata = () =>
                     remoteVideoElement.play();

                  peerConnection.onconnectionstatechange = () => {
                     if (peerConnection.connectionState === "failed") {
                        console.log(`Connection severed with ${peerName}`);
                        remoteVideoElement.remove();
                        socket.off(`peer-${peerName}-left`);
                     }
                  };

                  socket.on(`peer-${peerName}-left`, () => {
                     console.log("removing dom video element");
                     remoteVideoElement.remove();
                     socket.off(`peer-${peerName}-left`);
                  });

                  prevStreamId = remoteStream.id;
               };

               socket.on(
                  `call-answer-${peerName}-${User.UniqueUsername}`,
                  async callAnswer => {
                     try {
                        await peerConnection.setRemoteDescription(
                           new RTCSessionDescription(callAnswer)
                        );
                     } catch (error) {
                        console.log(error);
                     }
                  }
               );

               let offer = await peerConnection.createOffer();
               await peerConnection.setLocalDescription(offer);

               socket.emit("call-offer-specific-peer", {
                  offer,
                  roomId: match.params.roomId,
                  peerName,
                  callerName: User.UniqueUsername,
               });

               function iceCandidateListener(ice) {
                  if (ice.candidate)
                     socket.emit("new-ice-candidate-for-specific-peer", {
                        iceCandidate: ice.candidate,
                        roomId: match.params.roomId,
                        peerName,
                        callerName: User.UniqueUsername,
                     });
               }
               peerConnection.onicecandidate = iceCandidateListener;

               socket.on(
                  `new-ice-candidate-${peerName}-${User.UniqueUsername}`,
                  async iceCandidate => {
                     try {
                        await peerConnection.addIceCandidate(iceCandidate);
                     } catch (error) {
                        console.log(error);
                     }
                  }
               );

               peerConnection.onconnectionstatechange = () => {
                  if (peerConnection.connectionState === "connected") {
                     socket.off(
                        `call-answer-${peerName}-${User.UniqueUsername}`
                     );
                     socket.off(
                        `new-ice-candidate-${peerName}-${User.UniqueUsername}`
                     );
                     peerConnection.removeEventListener(
                        "icecandidate",
                        iceCandidateListener
                     );
                     console.log(
                        "Real-time connection to peer established!!!!!"
                     );
                  }
               };
            } catch (error) {
               console.log(error);
            }
         });
         await setUpCallReception();
         initiateCall();
      } catch (error) {
         console.log(error);
         setActionStatus({ info: "Error joining meet room", type: "error" });
      } finally {
         setIsLoading(false);
      }
   }

   function closeConfirmModal() {
      setConfirmRequired(false);
   }

   return (
      <div className={classes.roomContainer}>
         <h2>{roomName}</h2>
         <ContentModal
            isModalOpen={confirmRequired}
            handleModalClose={closeConfirmModal}
            disableClickAway={true}
            disableEscapeClose={true}
         >
            <div className={classes.joinRoom}>
               <Button
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                  onClick={initializeMeetRoom}
               >
                  Join Call
               </Button>
               {isLoading && <CenteredLoader absolutelyPositioned />}
            </div>
         </ContentModal>
         <div className={classes.streamsContainer} ref={videoRef}></div>
         <video
            className={classes.localVideo}
            muted={true}
            ref={localVideoElementRef}
         ></video>
      </div>
   );
}

export default MeetRoom;
