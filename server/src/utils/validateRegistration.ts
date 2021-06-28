import User from "../models/User";

async function validateRegistration(userInfo: {
   UniqueUsername: string;
   Email: string;
}) {
   try {
      const user = await User.findOne(
         { ...userInfo },
         { Password: 0, updatedAt: 0, __v: 0 }
      ).lean();

      if (user) {
         return user;
      } else return null;
   } catch (error) {
      return null;
   }
}

export default validateRegistration;
