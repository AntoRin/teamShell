function parseQueryStrings(queryString) {
   let allPairs = queryString.split("?")[1];
   let pairArray = allPairs.split("&");

   let queries = {};

   pairArray.forEach(pair => {
      let [key, value] = pair.split("=");
      queries[key] = value;
   });

   return queries;
}

export default parseQueryStrings;
