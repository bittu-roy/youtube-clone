//---------- USING PROMISE METHOD------------------
const asyncHandler= (requestHandler)=>{
      (req, res, next)=>{
        Promise.resolve(requestHandler(req, res, next)).catch((err)=> next(err))
      }
}


export {asyncHandler}







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