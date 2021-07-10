import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types";

export function ThrowsServiceException(_: Object, __: string, descriptor: PropertyDescriptor) {
   const method = descriptor.value;

   descriptor.value = async function (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
   ) {
      try {
         return await method.apply(this, [req, res, next]);
      } catch (error) {
         console.log("Error caught by decorator");
         return next(error);
      }
   };
}
