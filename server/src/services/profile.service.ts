import { NextFunction, Response } from "express";
import { UserModel } from "../interfaces/UserModel";
import ProfileImage from "../models/ProfileImage";
import User from "../models/User";
import { AuthenticatedRequest, RequestUserType } from "../types";
import AppError from "../utils/AppError";

export class ProfileService {
   public static async getSingleUser(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { UniqueUsername } = req.thisUser as RequestUserType;
      const requestedUser = req.params.UniqueUsername;

      try {
         const queryResult = await User.findOne(
            {
               UniqueUsername: requestedUser,
            },
            { Password: 0, updatedAt: 0, Notifications: 0, __v: 0 }
         ).lean();

         if (!queryResult) throw new AppError("UserNotFoundError");

         let user;

         if (UniqueUsername === requestedUser) {
            user = queryResult;
         } else {
            const { Issues, Solutions, ...limitedAccessData } = queryResult;
            user = limitedAccessData;
         }

         if (user) return res.json({ status: "ok", user });
         else throw new AppError("BadRequestError");
      } catch (error) {
         return next(error);
      }
   }

   public static async getUserProfileImage(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const requestedUser = req.params.UniqueUsername;

      try {
         const profileImage = await ProfileImage.findOne({
            UserContext: requestedUser,
         });

         let imageUrl = "/assets/UserIcon.png";

         if (profileImage) {
            const savedImage = profileImage.ImageData;

            if (savedImage.startsWith("https://")) {
               imageUrl = savedImage;
            } else {
               res.set({ "Content-Type": "image/png" });
               return res.write(savedImage, "base64", err => {
                  if (err) throw err;
               });
            }
         }

         return res.redirect(303, imageUrl);
      } catch (error) {
         return next(error);
      }
   }

   public static async editUserProfile(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { Bio, Username } = req.body;
      const { UniqueUsername, Email } = req.thisUser as RequestUserType;

      try {
         await User.updateOne({ UniqueUsername, Email }, { Bio, Username });
         res.json({ status: "ok", message: "Profile Updated" });
      } catch (error) {
         return next(error);
      }
   }

   public static async uploadProfileImage(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { UniqueUsername } = req.thisUser as RequestUserType;
      try {
         const file = req.file;

         if (!file) throw new AppError("UploadFailureError");

         const buffer = file.buffer;

         const ImageData = buffer.toString("base64");

         await ProfileImage.updateOne(
            { UserContext: UniqueUsername },
            { ImageData },
            { upsert: true }
         );

         return res.json({ status: "ok", data: "Image Uploaded" });
      } catch (error) {
         return next(error);
      }
   }

   public static async getUserNotifications(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { UniqueUsername, Email } = req.thisUser as RequestUserType;

      try {
         const user = await User.findOne({ UniqueUsername, Email }).lean();
         if (!user) throw new AppError("UnauthorizedRequestError");
         const { Notifications } = user;
         return res.json({ status: "ok", data: { Notifications } });
      } catch (error) {
         return next(error);
      }
   }

   public static async updateSeenNotifications(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { UniqueUsername, Email } = req.thisUser as RequestUserType;

      try {
         await User.updateOne(
            { UniqueUsername, Email, "Notifications.Seen": false },
            { $set: { "Notifications.$[].Seen": true } },
            { multi: true }
         );
         return res.json({ status: "ok", data: "" });
      } catch (error) {
         console.log(error);
         next(error);
      }
   }

   public static async getUserProfilesBasedOnSearchQuery(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { UniqueUsername } = req.thisUser as RequestUserType;
      const query = req.query.user;

      try {
         const regexSearch = await User.find({
            UniqueUsername: {
               $regex: new RegExp(`\\b\\w*${query}\\w*\\b`, "i"),
            },
         });

         let searchData: Array<string | null> = ["Not found"];

         if (regexSearch.length > 0)
            searchData = regexSearch.map(resultUser =>
               resultUser.UniqueUsername !== UniqueUsername
                  ? resultUser.UniqueUsername
                  : null
            );

         return res.json({ status: "ok", data: searchData });
      } catch (error) {
         return next(error);
      }
   }

   public static async getAllUserContacts(
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      const { UniqueUsername } = req.thisUser as RequestUserType;

      try {
         const aggregrationPipeline = [
            {
               $match: {
                  UniqueUsername,
               },
            },
            {
               $lookup: {
                  from: "Organizations",
                  localField: "Organizations.OrganizationName",
                  foreignField: "OrganizationName",
                  as: "SameOrg",
               },
            },
            {
               $lookup: {
                  from: "Users",
                  localField: "SameOrg.Members",
                  foreignField: "UniqueUsername",
                  as: "MembersOfSameOrg",
               },
            },
            {
               $project: {
                  "MembersOfSameOrg.UniqueUsername": 1,
               },
            },
         ];

         const sameOrgAggregation = await User.aggregate(aggregrationPipeline);
         const contacts = sameOrgAggregation[0].MembersOfSameOrg.map(
            (member: UserModel) =>
               member.UniqueUsername !== UniqueUsername
                  ? member.UniqueUsername
                  : null
         );

         return res.json({ status: "ok", data: contacts });
      } catch (error) {
         return next(error);
      }
   }
}
