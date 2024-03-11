import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"          

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret:  process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary= async (localFilePath)=>{
     try{
        if(!localFilePath) return null;
        //upload the file on cloudinary
        const response= await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded successfully
      //   console.log("file is uploaded on cloudinary", response.url);

      //file is uploaded successfully so we remove/unlink the file and we are using unlinkSync because we want to move forward even after this.
      
      fs.unlinkSync(localFilePath)
      return response;

     }
     //if file doesn't gets uploaded then for a safe cleaning purpose the local path should be removed from the server.
     catch(error){
        fs.unlinkSync(localFilePath)
        //removes the locally saved file path as the uploaded option got failed
        return null
     }
}


export {uploadOnCloudinary}