export function GET(route: string) {
   return function (_: any, __: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = function (...args: Array<any>) {
         return {
            routeHandlers: originalMethod.apply(this, args),
            path: route,
            restMethod: "get",
         };
      };
   };
}

export function POST(route: string) {
   return function (_: any, __: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = function (...args: Array<any>) {
         return {
            routeHandlers: originalMethod.apply(this, args),
            path: route,
            restMethod: "post",
         };
      };
   };
}

export function PUT(route: string) {
   return function (_: any, __: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = function (...args: Array<any>) {
         return {
            routeHandlers: originalMethod.apply(this, args),
            path: route,
            restMethod: "put",
         };
      };
   };
}

export function DELETE(route: string) {
   return function (_: any, __: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = function (...args: Array<any>) {
         return {
            routeHandlers: originalMethod.apply(this, args),
            path: route,
            restMethod: "delete",
         };
      };
   };
}
