const User = require("../models/User");
const ProfileImage = require("../models/ProfileImage");

async function validateRegistration(userInfo) {
   try {
      let { _doc } = await User.findOne(
         { ...userInfo },
         { Password: 0, updatedAt: 0, __v: 0 }
      );

      let user = { ..._doc };

      if (user) {
         let profileImage = await ProfileImage.findOne({
            UserContext: userInfo.UniqueUsername,
         });
         if (profileImage) {
            user.ProfileImage = profileImage.ImageData;
         }

         return user;
      } else return null;
   } catch (error) {
      return null;
   }
}

module.exports = validateRegistration;
