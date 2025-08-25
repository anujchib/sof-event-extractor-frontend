import React from 'react'
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const fileInputReference = useRef(null);
  const dropZoneRef = useRef(null);
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

  // Prevent default drag behaviors on document
  useEffect(() => {
    const preventDefault = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDocumentDrop = (e) => {
      preventDefault(e);
    };

    // Add event listeners to document to prevent default behavior
    document.addEventListener('dragenter', preventDefault);
    document.addEventListener('dragover', preventDefault);
    document.addEventListener('drop', handleDocumentDrop);

    return () => {
      document.removeEventListener('dragenter', preventDefault);
      document.removeEventListener('dragover', preventDefault);
      document.removeEventListener('drop', handleDocumentDrop);
    };
  }, []);

  // Drag and drop handlers for drop zone
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragOver to false if we're leaving the drop zone entirely
    if (!dropZoneRef.current?.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
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
    <div className='bg-gradient-to-br from-green-800 to-green-900 flex flex-col min-h-screen text-white'>
      {/* Header Warning */}
      <div className='w-full flex items-center justify-center border-2 border-yellow-400 border-dashed bg-yellow-900/20 py-6 m-4 rounded-lg'>
        <h1 className='text-lg font-semibold text-yellow-200 text-center px-4'>
          ⚠️ This page is for Testing only - a separate UI is in production ⚠️
        </h1>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex items-center justify-center p-4'>
        <div className='flex flex-col lg:flex-row justify-center items-stretch w-full max-w-6xl gap-6'>
          
          {/* Drag and Drop Zone */}
          <div 
            ref={dropZoneRef}
            className={`
              relative flex-1 min-h-[300px] flex flex-col justify-center items-center 
              border-3 border-dashed rounded-2xl p-8 transition-all duration-300 ease-in-out
              cursor-pointer hover:scale-[1.02] transform
              ${isDragOver 
                ? 'border-blue-400 bg-blue-900/30 shadow-2xl shadow-blue-500/20 scale-[1.02]' 
                : 'border-white/50 bg-white/5 hover:border-white/70 hover:bg-white/10'
              }
            `}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <div className='text-center'>
              <div className='text-6xl mb-4'>
                {isDragOver ? '🎯' : '📁'}
              </div>
              <h2 className='text-2xl font-bold mb-3'>
                {isDragOver ? 'Drop files here!' : 'Drag & Drop Files'}
              </h2>
              <p className='text-lg text-white/70 mb-4'>
                {isDragOver ? 'Release to upload' : 'or click to browse files'}
              </p>
              <div className='text-sm text-white/50'>
                Support for multiple files
              </div>
            </div>
            
            {/* Animated border effect */}
            {isDragOver && (
              <div className='absolute inset-0 border-3 border-blue-400 rounded-2xl animate-pulse'></div>
            )}
          </div>

          {/* OR Divider */}
          <div className='flex items-center justify-center lg:flex-col'>
            <div className='bg-white/20 rounded-full px-4 py-2 text-sm font-medium'>
              OR
            </div>
          </div>

          {/* Upload Button Section */}
          <div className="flex flex-1 justify-center items-center min-h-[300px] border-2 border-white/30 border-dashed rounded-2xl bg-white/5">
            <div className='text-center'>
              <div className='text-4xl mb-4'>⬆️</div>
              <h3 className='text-xl font-semibold mb-4'>Traditional Upload</h3>
              <button 
                onClick={handleClick}
                className="px-8 py-4 bg-white text-green-800 font-semibold rounded-full 
                         shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 
                         transition-all duration-200 transform hover:bg-gray-100"
                type="submit"
              >
                📂 Choose Files
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        className="hidden"
        type="file"
        multiple
        id="actual-btn"
        ref={fileInputReference}
        onChange={handleFileChange} 
      />

      {/* Footer Warning */}
      <div className='w-full flex justify-center border-2 border-red-400 border-dashed bg-red-900/20 py-4 m-4 rounded-lg'>
        <p className='text-red-200 text-center px-4'>
          ⚠️ Don't upload files larger than 10MB - No file validation implemented yet! ⚠️
        </p>
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
