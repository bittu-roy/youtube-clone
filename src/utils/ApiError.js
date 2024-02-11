//Whenever we face an error it should go through our ApiError file itself

class ApiError extends Error{
    constructor(
        statusCode,
        message= "Something went wrong",
        errors= [],
        stack= ""
    ){
      super(message)
      this.statusCode= statusCode
      this.data= null
      this.message= message
      this.success= false;
      this.errors= errors


      //programmers usually try to keep errors in form of stack so we wrote the below code.
      if(stack){
        this.stack= stack
      }
      else{
        Error.captureStackTrace(this, this.constructor)
      }
    }
}

export {ApiError}