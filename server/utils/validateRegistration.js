const mongoose = require("mongoose");

async function validateRegistration(userInfo, collection) {
   let present = await collection.findOne({ ...userInfo });
   if (present) return true;
   else return false;
}

module.exports = validateRegistration;
