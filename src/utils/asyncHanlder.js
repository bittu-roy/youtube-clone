//---------- USING PROMISE METHOD------------------
const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
      try {
          await Promise.resolve(requestHandler(req, res, next));
      } catch (error) {
          const statusCode = error.statusCode || 500;
          const errorMessage = error.message || "Internal Server Error";
          res.status(statusCode).json({
              success: false,
              error: errorMessage
          });
      }
  };
};

export default asyncHandler;







//------------ USING TRY CATCH METHOD--------------
// const asyncHandler= (func)=> async(req, res, next)=>{
//      try{
//         await func(req, res, next)
//      }
//      catch(error){
//           res.send(err.code || 500).json({
//             success: false,
//             message: err.message
//           })
//      }
// }