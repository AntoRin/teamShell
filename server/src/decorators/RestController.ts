import { Router } from "express";

export function GET(route: string) {
   return function (target: any, _: string, descriptor: PropertyDescriptor) {
      try {
         const routerInstance: Router = target.constructor.router;
         if (!routerInstance) throw new Error("NoRouter");
         routerInstance.get(route, descriptor.value());
      } catch (error: any) {
         console.log(
            "A private static instance of express router is required to initialize api routes"
         );
         console.log(error.stack);
         throw error.message;
      }
   };
}

export function POST(route: string) {
   return function (target: any, _: string, descriptor: PropertyDescriptor) {
      try {
         const routerInstance: Router = target.constructor.router;
         if (!routerInstance) throw new Error("No router");
         routerInstance.post(route, descriptor.value());
      } catch (error: any) {
         console.log(
            "A private static instance of express router is required to initialize api routes"
         );
         console.log(error.stack);
         throw error.message;
      }
   };
}

export function PUT(route: string) {
   return function (target: any, _: string, descriptor: PropertyDescriptor) {
      try {
         const routerInstance: Router = target.constructor.router;
         if (!routerInstance) throw new Error("NoRouter");
         routerInstance.put(route, descriptor.value());
      } catch (error: any) {
         console.log(
            "A private static instance of express router is required to initialize api routes"
         );
         console.log(error.stack);
         throw error.message;
      }
   };
}

export function DELETE(route: string) {
   return function (target: any, _: string, descriptor: PropertyDescriptor) {
      try {
         const routerInstance: Router = target.constructor.router;
         if (!routerInstance) throw new Error("NoRouter");
         routerInstance.delete(route, descriptor.value());
      } catch (error: any) {
         console.log(
            "A private static instance of express router is required to initialize api routes"
         );
         console.log(error.stack);
         throw error.message;
      }
   };
}
