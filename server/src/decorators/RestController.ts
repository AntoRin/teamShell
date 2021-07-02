import { Router } from "express";
import { HandlerMetadata } from "./types";

export function RestController(routePrefix: string) {
   return function (constructor: Function) {
      const routerInstance: Router = constructor.prototype.constructor.router;

      for (const propName of Object.getOwnPropertyNames(
         constructor.prototype
      )) {
         const prop = constructor.prototype[propName];

         if (
            typeof prop === "function" &&
            constructor.prototype.hasOwnProperty(propName)
         ) {
            try {
               const { routeHandlers, path, restMethod }: HandlerMetadata =
                  prop();

               if (Array.isArray(routeHandlers)) {
                  for (const handler of routeHandlers) {
                     if (typeof handler !== "function")
                        throw new Error(
                           "Only functions should be returned from Controller methods"
                        );
                  }
               } else {
                  if (typeof routeHandlers !== "function")
                     throw new Error(
                        "Only functions should be returned from Controller methods"
                     );
               }

               switch (restMethod) {
                  case "get":
                     routerInstance.get(`${routePrefix}${path}`, routeHandlers);
                     break;
                  case "post":
                     routerInstance.post(
                        `${routePrefix}${path}`,
                        routeHandlers
                     );
                     break;
                  case "put":
                     routerInstance.put(`${routePrefix}${path}`, routeHandlers);
                     break;
                  case "delete":
                     routerInstance.delete(
                        `${routePrefix}${path}`,
                        routeHandlers
                     );
                     break;
               }
            } catch (error) {}
         }
      }
      return;
   };
}
