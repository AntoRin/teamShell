class AppError extends Error {
   constructor(name: string, message = "There has been an error") {
      super(message);
      this.name = name;
   }
}

export default AppError;
