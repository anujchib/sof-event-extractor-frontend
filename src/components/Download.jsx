import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Download = () => {
    const location = useLocation();
    const data = location.state;
    const fileList = data?.selectedFiles; 
    const file = fileList?.[0]; 
    const [uploadStatus, setUploadStatus] = useState('preparing');
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        // Prevent double execution
        if (hasStarted) {
            console.log('⏭️ Upload already started, skipping...');
            return;
        }
        
        const uploadFile = async () => {
            console.log('🚀 Starting upload process');
            setHasStarted(true); // Mark as started
            setUploadStatus('uploading');
            
            try {
                console.log('🚀 Starting upload for file:', file.name);
                console.log('📊 File details:', {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    lastModified: file.lastModified
                });
                
                // Validate file before upload
                if (file.size === 0) {
                    throw new Error('File is empty (0 bytes)');
                }
                
                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                    throw new Error('File too large (max 10MB)');
                }
                
                if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
                    console.warn('⚠️ Warning: File might not be a PDF');
                }
                
                console.log('📡 Sending request to backend...');
                const response = await fetch('http://localhost:3000/upload-url', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileType: file.type || 'application/pdf',
                        fileSize: file.size
                    })
                });

                if (!response.ok) {
                    throw new Error(`Backend error: ${response.status} ${response.statusText}`);
                }

                const responseData = await response.json();
                console.log('✅ Backend response:', responseData);
                
                const { uploadURL } = responseData;

                if (!uploadURL) {
                    throw new Error('No upload URL received from server');
                }

                console.log('🎯 Upload URL received, starting S3 upload...');
                console.log('📤 Uploading', file.size, 'bytes to S3...');
                
                // Upload file directly to S3 using pre-signed URL
                const uploadResponse = await fetch(uploadURL, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type || 'application/pdf'
                    }
                });

                console.log('📊 S3 Response Status:', uploadResponse.status);
                console.log('📊 S3 Response Headers:', Object.fromEntries(uploadResponse.headers.entries()));
                
                if (uploadResponse.ok) {
                    console.log('✅ Upload completed successfully to S3');
                    console.log('🔗 File should be available at:', `s3://file-uploads-mumbai/${file.name}`);
                    setUploadStatus('success');
                } else {
                    const errorText = await uploadResponse.text();
                    console.error('❌ S3 upload failed:', {
                        status: uploadResponse.status,
                        statusText: uploadResponse.statusText,
                        error: errorText
                    });
                    throw new Error(`S3 upload failed: ${uploadResponse.status}`);
                }
                
            } catch (error) {
                console.error('❌ Upload error:', error);
                setUploadStatus('error');
            }
        };

        // Check if we have a valid file
        if (file && file.name && !hasStarted) {
            console.log('✅ Valid file found, starting upload:', file.name);
            uploadFile();
        } else if (!file || !file.name) {
            console.error('❌ No valid file found:', { fileList, file });
        }
    }, [file, hasStarted]);

    return (
        <div>
            <div className='flex justify-center items-center border border-white border-dashed p-8'>
                <div className="text-center">
                    {uploadStatus === 'preparing' && <h1>Wait We are cooking your file!</h1>}
                    {uploadStatus === 'uploading' && <h1>🚀 Uploading your file...</h1>}
                    {uploadStatus === 'success' && <h1 className="text-green-500">✅ Upload Complete!</h1>}
                    {uploadStatus === 'error' && <h1 className="text-red-500">❌ Upload Failed!</h1>}
                    {file && <p className="mt-2 text-sm">File: {file.name} ({file.size} bytes)</p>}
                </div>
            </div>
        </div>
    );
};

export default Download;