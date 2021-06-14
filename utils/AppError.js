class AppError extends Error {
   constructor(name, message = "There has been an error") {
      super(message);
      this.name = name;
   }
}

module.exports = AppError;
