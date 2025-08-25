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

    document.addEventListener('dragenter', preventDefault);
    document.addEventListener('dragover', preventDefault);
    document.addEventListener('drop', handleDocumentDrop);

    return () => {
      document.removeEventListener('dragenter', preventDefault);
      document.removeEventListener('dragover', preventDefault);
      document.removeEventListener('drop', handleDocumentDrop);
    };
  }, []);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
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
    <div className='bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='border-b bg-white'>
        <div className='max-w-4xl mx-auto px-6 py-4'>
          <h1 className='text-2xl font-semibold text-gray-900'>File Upload</h1>
          <p className='text-sm text-gray-600 mt-1'>Upload your files to get started</p>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-4xl mx-auto px-6 py-12'>
        <div className='bg-white rounded-lg shadow-sm border'>
          <div className='p-8'>
            
            {/* Drop Zone */}
            <div 
              ref={dropZoneRef}
              className={`
                relative border-2 border-dashed rounded-lg p-12 text-center transition-colors
                ${isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className='space-y-4'>
                <div className='mx-auto w-12 h-12 text-gray-400'>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                  </svg>
                </div>
                
                <div>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    {isDragOver ? 'Drop files here' : 'Drag and drop files here'}
                  </h3>
                  <p className='text-gray-600 mb-4'>or</p>
                  <button 
                    onClick={handleClick}
                    className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    Browse files
                  </button>
                </div>
                
                <p className='text-xs text-gray-500'>
                  Supports multiple file selection
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Warnings */}
        <div className='mt-8 space-y-4'>
          <div className='bg-amber-50 border border-amber-200 rounded-md p-4'>
            <div className='flex'>
              <div className='text-amber-400'>
                <svg className='h-5 w-5' fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className='ml-3'>
                <p className='text-sm text-amber-800'>
                  This is a testing environment. Production UI is available separately.
                </p>
              </div>
            </div>
          </div>

          <div className='bg-red-50 border border-red-200 rounded-md p-4'>
            <div className='flex'>
              <div className='text-red-400'>
                <svg className='h-5 w-5' fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className='ml-3'>
                <p className='text-sm text-red-800'>
                  Please limit file size to under 10MB. File validation is not implemented yet.
                </p>
              </div>
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
