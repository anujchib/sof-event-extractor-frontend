import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Download = () => {
  const location = useLocation();
  const data = location.state;
  const fileList = data?.selectedFiles;
  const file = fileList?.[0];

  const [downloadUrl, setDownloadUrl] = useState(null);
  const [CSVdownloadUrl, CSVsetDownloadUrl] = useState(null);

  const handleDownload = (url, fileName) => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  useEffect(() => {
    if (!file) return;
    const uploadFile = async () => {
      try {
        const upload = await fetch("https://sof-event-extractor-backend-production.up.railway.app/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        });
        if (!upload.ok) throw new Error("Failed to get upload URL");
        const { uploadURL } = await upload.json();
        const s3Upload = await fetch(uploadURL, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!s3Upload.ok) throw new Error("Upload failed");
      } catch (error) {
        console.error("Upload error ❌", error);
      }
    };
    uploadFile();
  }, [file]);

  const originalName = file?.name || "";
  const baseName = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;

  // Helper function to try multiple possible file names
  const tryDownloadVariants = async (fileType, setUrl) => {
    const now = new Date();
    
    // Try different timestamp patterns (last 30 minutes)
    for (let i = 0; i < 30; i++) {
      const testTime = new Date(now.getTime() - (i * 60000)); // Go back minute by minute
      const timestamp = testTime.toISOString().replace(/:/g, '-').replace(/\./g, '-').slice(0, -1) + 'Z';
      
      let fileName;
      if (fileType === 'json') {
        fileName = `extracted-text/${baseName}_extracted-claude-maritime-data-${timestamp}.json`;
      } else {
        fileName = `extracted-text/${baseName}_extracted-claude-events-${timestamp}.csv`;
      }
      
      try {
        console.log(`Trying ${fileType}: ${fileName}`);
        const res = await fetch("https://sof-event-extractor-backend-production.up.railway.app/download-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName }),
        });
        
        if (!res.ok) {
          console.log(`Response not ok for ${fileName}`);
          continue;
        }

        const downloadResponse = await res.json();
        console.log(`Response for ${fileName}:`, downloadResponse);
        
        // Fix: Check the response structure correctly
        if (downloadResponse.ready && downloadResponse.downloadURL) {
          console.log(`✅ Found ${fileType.toUpperCase()} file: ${fileName}`);
          console.log(`✅ Signed ${fileType.toUpperCase()} URL:`, downloadResponse.downloadURL);
          setUrl(downloadResponse.downloadURL);
          return true; // Found the file
        }
      } catch (error) {
        console.log(`Error checking ${fileName}:`, error.message);
        continue;
      }
    }
    
    return false; // File not found
  };

  // Check for JSON file
  useEffect(() => {
    if (!file) return;
    let retryTimeout;
    
    const checkDownload = async () => {
      const found = await tryDownloadVariants('json', setDownloadUrl);
      
      if (!found) {
        console.log("JSON file not found, retrying in 5 seconds...");
        retryTimeout = setTimeout(checkDownload, 5000);
      }
    };
    
    // Start checking after a short delay to let the upload complete
    const initialTimeout = setTimeout(checkDownload, 2000);
    
    return () => {
      clearTimeout(retryTimeout);
      clearTimeout(initialTimeout);
    };
  }, [file, baseName]);

  // Check for CSV file
  useEffect(() => {
    if (!file) return;
    let retryTimeout;
    
    const checkDownload = async () => {
      const found = await tryDownloadVariants('csv', CSVsetDownloadUrl);
      
      if (!found) {
        console.log("CSV file not found, retrying in 5 seconds...");
        retryTimeout = setTimeout(checkDownload, 5000);
      }
    };
    
    // Start checking after a short delay to let the upload complete
    const initialTimeout = setTimeout(checkDownload, 2000);
    
    return () => {
      clearTimeout(retryTimeout);
      clearTimeout(initialTimeout);
    };
  }, [file, baseName]);

  return (
    <div className="flex flex-col justify-center items-center h-dvh">
      <div className="mx-auto">
        <h1 className="text-center text-9xl">🧑‍🍳</h1>
      </div>
      
      {/* Debug info */}
      <div className="mb-4 text-sm text-gray-600 text-center">
        <p>Processing file: <span className="font-mono">{originalName}</span></p>
        <p>Base name: <span className="font-mono">{baseName}</span></p>
      </div>

      {(downloadUrl || CSVdownloadUrl) ? (
        <div className="flex gap-4">
          {downloadUrl && (
            <button
              onClick={() => handleDownload(downloadUrl, `${baseName}_maritime-data.json`)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
            >
              📄 Download JSON
            </button>
          )}
          {CSVdownloadUrl && (
            <button
              onClick={() => handleDownload(CSVdownloadUrl, `${baseName}_events.csv`)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
            >
              📊 Download CSV
            </button>
          )}
        </div>
      ) : (
        <div className="text-center">
          <h1 className="m-10 font-bold text-xl">
            Your file is cooking, download buttons will appear here soon! 🍳
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            ⚠️ Please check the console in Chrome to see the download process.
          </p>
          <div className="text-sm text-gray-500">
            <p>Looking for:</p>
            <p className="font-mono text-xs break-all">
              {baseName}_extracted-claude-maritime-data-[timestamp].json
            </p>
            <p className="font-mono text-xs break-all">
              {baseName}_extracted-claude-events-[timestamp].csv
            </p>
          </div>
          
          {/* Loading indicator */}
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Download;