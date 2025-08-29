import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Download = () => {
  const location = useLocation();
  const data = location.state;
  const fileList = data?.selectedFiles;
  const file = fileList?.[0];

  const [downloadUrl, setDownloadUrl] = useState(null);
  const [CSVdownloadUrl, CSVsetDownloadUrl] = useState(null);
  const [actualJsonFileName, setActualJsonFileName] = useState(null);
  const [actualCSVFileName, setActualCSVFileName] = useState(null);

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
        console.error("Upload error ⌐", error);
      }
    };
    uploadFile();
  }, [file]);

  const originalName = file?.name || "";
  const baseName =
    originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
  const safeBaseName = baseName.replace(/\s+/g, "_");

  // Function to find available files for the base name
  const findAvailableFiles = async (baseFileName) => {
    try {
      console.log('Searching for files with base name:', baseFileName);
      
      // Call the list-files endpoint to get available files
      const res = await fetch("https://sof-event-extractor-backend-production.up.railway.app/list-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          baseFileName: baseFileName,
          directory: "extracted-text" 
        }),
      });
      
      if (!res.ok) {
        console.log("List-files endpoint not available, falling back to pattern matching");
        return await findFilesByPattern(baseFileName);
      }
      
      const data = await res.json();
      
      if (data.error) {
        console.log("Error from list-files:", data.error);
        return await findFilesByPattern(baseFileName);
      }
      
      const { files } = data;
      console.log('Available files from backend:', files);
      
      if (!files || files.length === 0) {
        console.log('No files found, will retry...');
        return {};
      }
      
      // Find JSON and CSV files
      const jsonFile = files.find(f => f.endsWith('.json'));
      const csvFile = files.find(f => f.endsWith('.csv'));
      
      console.log('Found files:', { jsonFile, csvFile });
      
      const results = {};
      
      // Get download URL for JSON file
      if (jsonFile) {
        try {
          const jsonRes = await fetch("https://sof-event-extractor-backend-production.up.railway.app/download-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: `extracted-text/${jsonFile}` }),
          });
          const jsonResponse = await jsonRes.json();
          const { downloadURL } = jsonResponse;
          const { ready, downloadURL: signedUrl } = downloadURL || {};
          if (ready && signedUrl) {
            results.json = { url: signedUrl, fileName: jsonFile };
          }
        } catch (error) {
          console.error('Error getting JSON download URL:', error);
        }
      }
      
      // Get download URL for CSV file
      if (csvFile) {
        try {
          const csvRes = await fetch("https://sof-event-extractor-backend-production.up.railway.app/download-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: `extracted-text/${csvFile}` }),
          });
          const csvResponse = await csvRes.json();
          const { downloadURL } = csvResponse;
          const { ready, downloadURL: signedUrl } = downloadURL || {};
          if (ready && signedUrl) {
            results.csv = { url: signedUrl, fileName: csvFile };
          }
        } catch (error) {
          console.error('Error getting CSV download URL:', error);
        }
      }
      
      return results;
      
    } catch (error) {
      console.log("Error with list-files, falling back to pattern matching:", error);
      return await findFilesByPattern(baseFileName);
    }
  };

  // Fallback function that tries common patterns
  const findFilesByPattern = async (baseFileName) => {
    const results = {};
    
    // Common patterns to try
    const patterns = [
      `${baseFileName}_extracted-maritime-data-*`, // Will try recent timestamps
      `${baseFileName}_extracted-events`
    ];
    
    // Try JSON
    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        // Try recent timestamps for patterns with *
        const now = new Date();
        for (let i = 0; i < 15; i++) {
          const testTime = new Date(now.getTime() - (i * 60 * 1000));
          const timestamp = testTime.toISOString().replace(/:/g, '-').replace(/\./g, '-');
          const cleanTimestamp = timestamp.slice(0, -1) + 'Z';
          const fileName = pattern.replace('*', cleanTimestamp) + '.json';
          
          try {
            const res = await fetch("https://sof-event-extractor-backend-production.up.railway.app/download-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileName: `extracted-text/${fileName}` }),
            });
            const response = await res.json();
            const { downloadURL } = response;
            const { ready, downloadURL: signedUrl } = downloadURL || {};
            if (ready && signedUrl) {
              results.json = { url: signedUrl, fileName };
              break;
            }
          } catch (error) {
            continue;
          }
        }
      } else {
        // Try exact pattern
        const fileName = pattern + '.json';
        try {
          const res = await fetch("https://sof-event-extractor-backend-production.up.railway.app/download-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: `extracted-text/${fileName}` }),
          });
          const response = await res.json();
          const { downloadURL } = response;
          const { ready, downloadURL: signedUrl } = downloadURL || {};
          if (ready && signedUrl) {
            results.json = { url: signedUrl, fileName };
            break;
          }
        } catch (error) {
          continue;
        }
      }
      if (results.json) break;
    }
    
    // Try CSV with same patterns
    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        const now = new Date();
        for (let i = 0; i < 15; i++) {
          const testTime = new Date(now.getTime() - (i * 60 * 1000));
          const timestamp = testTime.toISOString().replace(/:/g, '-').replace(/\./g, '-');
          const cleanTimestamp = timestamp.slice(0, -1) + 'Z';
          const fileName = pattern.replace('*', cleanTimestamp) + '.csv';
          
          try {
            const res = await fetch("https://sof-event-extractor-backend-production.up.railway.app/download-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileName: `extracted-text/${fileName}` }),
            });
            const response = await res.json();
            const { downloadURL } = response;
            const { ready, downloadURL: signedUrl } = downloadURL || {};
            if (ready && signedUrl) {
              results.csv = { url: signedUrl, fileName };
              break;
            }
          } catch (error) {
            continue;
          }
        }
      } else {
        const fileName = pattern + '.csv';
        try {
          const res = await fetch("https://sof-event-extractor-backend-production.up.railway.app/download-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: `extracted-text/${fileName}` }),
          });
          const response = await res.json();
          const { downloadURL } = response;
          const { ready, downloadURL: signedUrl } = downloadURL || {};
          if (ready && signedUrl) {
            results.csv = { url: signedUrl, fileName };
            break;
          }
        } catch (error) {
          continue;
        }
      }
      if (results.csv) break;
    }
    
    return results;
  };

  // Check for both JSON and CSV files
  useEffect(() => {
    if (!file) return;
    let retryTimeout;
    
    const checkDownloads = async () => {
      const results = await findAvailableFiles(safeBaseName);
      
      if (results.json) {
        console.log("✅ Found JSON file:", results.json.fileName);
        setDownloadUrl(results.json.url);
        setActualJsonFileName(results.json.fileName);
      }
      
      if (results.csv) {
        console.log("✅ Found CSV file:", results.csv.fileName);
        CSVsetDownloadUrl(results.csv.url);
        setActualCSVFileName(results.csv.fileName);
      }
      
      // If neither file is ready, retry
      if (!results.json && !results.csv) {
        retryTimeout = setTimeout(checkDownloads, 3000);
      }
    };
    
    checkDownloads();
    return () => clearTimeout(retryTimeout);
  }, [file, safeBaseName]);

  return (
    <div className="flex flex-col justify-center items-center h-dvh">
      <div className="mx-auto">
        <h1 className="text-center text-9xl">🧑‍🍳</h1>
      </div>
      {(downloadUrl || CSVdownloadUrl) ? (
        <div className="flex">
          {downloadUrl && (
            <button
              onClick={() => handleDownload(downloadUrl, actualJsonFileName || `${safeBaseName}_extracted-events.json`)}
              className="border border-black py-2 px-10 rounded-4xl m-4"
            >
              Download JSON 
            </button>
          )}
          {CSVdownloadUrl && (
            <button
              onClick={() => handleDownload(CSVdownloadUrl, actualCSVFileName || `${safeBaseName}_extracted-events.csv`)}
              className="border border-black py-2 px-10 rounded-4xl m-4"
            >
              Download CSV    
            </button>
          )}
        </div>
      ) : (
        <h1 className="m-10 font-bold text-xl">
          Your file is cooking, download button will appear here soon! ⚠️ Please visit console in chrome to get access to the files once the buttons appears Thanks !
        </h1>
      )}
    </div>
  );
};

export default Download;