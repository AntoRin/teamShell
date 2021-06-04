import { useState, useEffect } from "react";

function MeetRoom({ match, User }) {
   const [roomName, setRoomName] = useState(null);

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
         } catch (error) {
            console.log(error);
         }
      }

      verifyRoom();

      return () => abortFetch.abort();
   }, [match.params.roomId]);

   return (
      <div>
         <h5 style={{ wordBreak: "break-all" }}>{match.params.roomId}</h5>
      </div>
   );
}

export default MeetRoom;
