import multer from "multer";

// using diskStorage to saved our files     
// The folder to which the file has been saved--> destination:(req, file, cb)--> 
//       1. req- which comes from the user, 
//       2. file--> file is present inside multer itself which contains all the files and req we can configure inisde json body but file can't be so we use multer for it.
//       3. cb- callback function 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})