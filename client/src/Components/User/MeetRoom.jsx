import { useState, useEffect, useRef, useContext } from "react";
import { SocketInstance } from "../UtilityComponents/ProtectedRoute";

function MeetRoom({ match, User }) {
   const [roomName, setRoomName] = useState(null);
   const [verified, setVerified] = useState(false);
   const [streams, setStreams] = useState([]);

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
      if (!verified) return;

      async function initiateCall() {
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

            setStreams(prev => [stream, ...prev]);
            // socket.emit("meet-video-stream", {
            //    stream,
            //    roomId: match.params.roomId,
            // });
         } catch (error) {
            console.log(error);
         }
      }

      initiateCall();
   }, [verified, socket, match.params]);

   useEffect(() => {
      if (!streams.length > 0) return;

      streams.forEach(stream => {
         let videoElement = document.createElement("video");
         videoElement.srcObject = stream;
         videoRef.current.append(videoElement);
         videoElement.onloadedmetadata = () => videoElement.play();

         let recorder = new MediaRecorder(stream);
         let readable = new ReadableStream({
            start: controller => {
               recorder.ondataavailable = data => {
                  controller.enqueue(data.data);
               };
            },
         });
         recorder.start();

         setInterval(() => recorder.requestData());

         let streamReader = readable.getReader();

         setInterval(async () => {
            let { value, done } = await streamReader.read();
            if (done) return;
            console.log(value);
         });
      });
   }, [streams]);

   useEffect(() => {
      socket.on("incoming-video-stream", stream => {
         console.log("Incoming video stream");
         setStreams(prev => [stream, ...prev]);
      });

      return () => socket.off("incoming-video-stream");
   });

   return (
      <div>
         <h2>{roomName}</h2>
         <div ref={videoRef}></div>
      </div>
   );
}

export default MeetRoom;
