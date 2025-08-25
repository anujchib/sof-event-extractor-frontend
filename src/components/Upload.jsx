import React from 'react'
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const fileInputReference = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleClick = () => {
    fileInputReference.current.click();
  }

  const Navigate = useNavigate();

  const processFiles = (files) => {
    console.log(files);
    if (files.length > 0) {
      Navigate('/Download', {
        state: {
          selectedFiles: Array.from(files)
        }
      })
    }
  }

  const handleFileChange = (event) => {
    const selectedFile = event.target.files;
    processFiles(selectedFile);
  }

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    processFiles(files);
  };

  return (
    <div className='bg-green-800 flex flex-col min-h-screen'>
      <div className='w-full flex items-center justify-center border border-white border-dashed py-25'>
        <h1 className='text-xl'> ⚠️⚠️This page is for Testing only , a separate UI is in production ⚠️⚠️</h1>
      </div>

      <div className='border border-white border-dashed flex-1 flex items-center justify-center'>
        <div className='flex justify-around w-full mx-4 gap-4'>
          <div 
            className={`border border-white border-dotted w-full py-24 flex justify-center items-center transition-colors duration-200 ${
              isDragOver ? 'bg-green-700 border-solid' : ''
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <h1 className='text-center text-white'>
              {isDragOver ? '📁 Drop files here!' : '📁 Drag & Drop files here or use upload button'}
            </h1>
          </div>

          <div className="flex justify-center py-24 w-full items-center border">
            <button onClick={handleClick}
              className="px-3 text-sm lg:px-10 py-5 lg: bg-white shadow-2xl border rounded-full hover:shadow-md active:translate-y-1 transition duration-200"
              type="submit"
            >
              Upload Your file
            </button>
            <input
              className="hidden"
              type="file"
              multiple
              id="actual-btn"
              ref={fileInputReference}
              onChange={handleFileChange} />
          </div>
        </div>
      </div>

      <div className='w-full flex justify-center border border-white border-dashed py-25'>
        <h1>⚠️ Dont pass any big files that will exhaust our paid credits. ⚠️ Test a file less than 10 mb , for now no file validations are there ! </h1>
      </div>
    </div>
  )
}

export default Upload



































// import React from 'react'
// import { useRef } from 'react';
// import { useNavigate } from 'react-router-dom';

// const Upload = () => {
//       const fileInputReference = useRef(null);

//     const handleClick = ()=>{
//       fileInputReference.current.click();
     
//     }
//      const Navigate = useNavigate();

//     const handleFileChange = (event)=>{
//       const selectedFile = event.target.files;

//       // processFiles(selectedFile)
//        console.log(selectedFile);
//       if(selectedFile.length>0){
//          Navigate('/Download',{state:{
//          selectedFiles: Array.from(selectedFile)
//       }})

//       }
     
     



//     }
   
//   return (

//     <div className=' bg-green-800 flex flex-col min-h-screen '>
//           <div className=' w-full   flex items-center justify-center border border-white border-dashed  py-25 '>
//             <h1 className='text-xl'> ⚠️⚠️This page is for Testing only , a separate UI is in production ⚠️⚠️</h1>
//         </div>

        

    

//     <div className='border border-white border-dashed  flex-1 flex items-center justify-center'>

       

//         <div className=' flex justify-around w-full mx-4 gap-4 '>
//             <div className='border border-white border-dotted w-full py-24 flex justify-center items-center '>
//     <h1>⚠️Dropzone area⚠️ </h1>
//             </div>

            
//           <div className="flex justify-center  py-24 w-full items-center border  ">
//             <button onClick={handleClick}
//               className=" px-3 text-sm lg:px-10 py-5 lg: bg-white shadow-2xl border rounded-full hover:shadow-md active:translate-y-1  transition duration-200]"
//               type="sumbit"
//             >
//               Upload Your file
//             </button>

//             <input
//              className="hidden" 
//              type="file" 
//              multiple 
//              id="actual-btn"
//              ref={fileInputReference}
//              onChange={handleFileChange} />
//           </div>
//         </div>

       


      
//     </div>
//      <div className=' w-full  flex justify-center border border-white border-dashed  py-25 '>
//             <h1>⚠️ Dont pass any big files that will exhaust our paid credits. ⚠️   Test a file less than 10 mb , for now no file validations are there !  </h1>
//         </div>
//     </div>
//   )
// }

// export default Upload
