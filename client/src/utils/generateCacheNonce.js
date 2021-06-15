function generateCacheNonce() {
   let time = Date.now();
   let randomHex = Math.floor(Math.random() * 99999999).toString(16);

   return time + randomHex;
}

export default generateCacheNonce;
