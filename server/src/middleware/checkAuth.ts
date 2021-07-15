import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types";

function checkAuth(req: AuthenticatedRequest, _: Response, next: NextFunction) {
   const token = req.cookies.token;
   try {
      const thisUser = jwt.verify(token, process.env.JWT_SECRET!) as {
         UniqueUsername: string;
         Email: string;
      };
      req.thisUser = thisUser;
      return next();
   } catch (error) {
      return next(error);
   }
}

export default checkAuth;
