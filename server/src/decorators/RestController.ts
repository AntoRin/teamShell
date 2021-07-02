import { Router } from "express";
import AppError from "../utils/AppError";

export function GET(route: string) {
   return function (target: any, _: string, descriptor: PropertyDescriptor) {
      try {
         const routerInstance: Router = target.constructor.router;
         if (!routerInstance) throw new AppError("NoRouter");
         routerInstance.get(route, descriptor.value());
      } catch (error: any) {
         if (error.name === "NoRouter")
            console.log(
               "A private static instance of express router is required to initialize api routes"
            );
         throw error.message;
      }
   };
}

export function POST(route: string) {
   return function (target: any, _: string, descriptor: PropertyDescriptor) {
      try {
         const routerInstance: Router = target.constructor.router;
         if (!routerInstance) throw new AppError("No router");
         routerInstance.post(route, descriptor.value());
      } catch (error: any) {
         if (error.name === "NoRouter")
            console.log(
               "A private static instance of express router is required to initialize api routes"
            );
         throw error.message;
      }
   };
}

export function PUT(route: string) {
   return function (target: any, _: string, descriptor: PropertyDescriptor) {
      try {
         const routerInstance: Router = target.constructor.router;
         if (!routerInstance) throw new AppError("NoRouter");
         routerInstance.put(route, descriptor.value());
      } catch (error: any) {
         if (error.name === "NoRouter")
            console.log(
               "A private static instance of express router is required to initialize api routes"
            );
         throw error.message;
      }
   };
}

export function DELETE(route: string) {
   return function (target: any, _: string, descriptor: PropertyDescriptor) {
      try {
         const routerInstance: Router = target.constructor.router;
         if (!routerInstance) throw new AppError("NoRouter");
         routerInstance.delete(route, descriptor.value());
      } catch (error: any) {
         if (error.name === "NoRouter")
            console.log(
               "A private static instance of express router is required to initialize api routes"
            );
         throw error.message;
      }
   };
}
