import { useState,useEffect } from "react";
import { Await, useLocation } from "react-router-dom";


const Download =()=>{

    const location =  useLocation();
    const data = location.state;
    const fileList = data?.selectedFiles;
    const file = fileList?.[0]


    useEffect(()=>{
        const UploadingFile =  async()=>{
             console.log("Uploading started📈")

        try {

          const upload =  await fetch('https://localhost:3000/upload-url',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                
                body:JSON.stringify({
                    fileName : file.name,
                    fileType : file.type,
                    fileSize : file.size

                })

            })
           

         
          if (!upload.ok) throw new Error("Failed to get upload URL");
const UploadResponse = await upload.json();


         

          const {uploadURL} = UploadResponse;


           const s3Upload = await fetch(uploadURL,{
            method: 'PUT',
            headers: {
               'Content-Type'  : file.type
            },
            body:file
             

           })
           console.log("S3-Upload status📊",s3Upload.status);

           if(s3Upload.ok){
            console.log("File-Uploaded successfullyt✅")
           }


             }  catch (error) {

            console.log(error)
            
        }


        }

            
      

    UploadingFile();

       

    },[file])

    


    return(
      <div>
        Hello
      </div>
    );

}