import { useState, useEffect } from "react";

function useRequest(url, options) {
   const [data, setData] = useState(null);
   const [error, setError] = useState(null);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      if (!url) return;

      let abortFetch = new AbortController();

      async function makeHTTPRequest() {
         try {
            let responseStream = await fetch(url, {
               ...JSON.parse(options),
               signal: abortFetch.signal,
            });
            if (abortFetch.signal.aborted) return;

            if (responseStream.status === 204) return;

            let response = await responseStream.json();

            if (response.status === "ok") {
               setData(response.data);
               setIsLoading(false);
            } else if (response.status === "error") throw response.error;
         } catch (error) {
            console.log(error);
            if (error.name === "AbortError") return;
            setError(error);
            setIsLoading(false);
         }
      }

      makeHTTPRequest();

      return () => abortFetch.abort();
   }, [url, options]);

   return { data, error, isLoading };
}

export default useRequest;
