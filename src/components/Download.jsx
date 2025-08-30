import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Download = () => {
  const location = useLocation();
  const data = location.state;
  const fileList = data?.selectedFiles;
  const file = fileList?.[0];

  const [downloadUrl, setDownloadUrl] = useState(null);
  const [CSVdownloadUrl, CSVsetDownloadUrl] = useState(null);
  const [foundFilenames, setFoundFilenames] = useState({ json: '', csv: '' });

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

  // Generate many possible base names that the backend might use
  const generatePossibleBaseNames = () => {
    const names = [];
    
    // Original filename variations
    names.push(baseName);
    names.push(baseName.toLowerCase());
    names.push(baseName.toUpperCase());
    
    // Remove special characters
    names.push(baseName.replace(/[^a-zA-Z0-9]/g, ''));
    names.push(baseName.replace(/[^a-zA-Z0-9]/g, '_'));
    names.push(baseName.replace(/[^a-zA-Z0-9]/g, '-'));
    
    // Lowercase versions
    names.push(baseName.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''));
    names.push(baseName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_'));
    names.push(baseName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-'));
    
    // Try first few words only
    const words = baseName.split(/\s+/);
    if (words.length > 1) {
      names.push(words[0]);
      names.push(words[0].toLowerCase());
      names.push(words.slice(0, 2).join('_'));
      names.push(words.slice(0, 2).join('').toLowerCase());
    }
    
    // For "STATEMENT OF FACTS" specifically, add common abbreviations
    if (baseName.toLowerCase().includes('statement') && baseName.toLowerCase().includes('facts')) {
      names.push('statement_of_facts');
      names.push('statementoffacts');
      names.push('sof');
      names.push('statement_facts');
    }
    
    // Generic fallbacks
    names.push('document');
    names.push('file');
    names.push('uploaded_file');
    
    // Remove duplicates
    return [...new Set(names)];
  };

  // Try to find the file with different patterns
  const tryDownloadVariants = async (fileType, setUrl, setFoundFilename) => {
    const now = new Date();
    const possibleBaseNames = generatePossibleBaseNames();
    
    console.log(`🔍 Searching for ${fileType.toUpperCase()} file with base names:`, possibleBaseNames);
    
    // Try different timestamp patterns (last 120 minutes = 2 hours)
    for (let i = 0; i < 120; i++) {
      const testTime = new Date(now.getTime() - (i * 60000)); // Go back minute by minute
      const timestamp = testTime.toISOString().replace(/:/g, '-').replace(/\./g, '-').slice(0, -1) + 'Z';
      
      // Try each possible base name
      for (const possibleBase of possibleBaseNames) {
        let fileName;
        if (fileType === 'json') {
          fileName = `extracted-text/${possibleBase}_extracted-claude-maritime-data-${timestamp}.json`;
        } else {
          fileName = `extracted-text/${possibleBase}_extracted-claude-events-${timestamp}.csv`;
        }
        
        try {
          console.log(`🔍 Trying: ${fileName}`);
          const res = await fetch("https://sof-event-extractor-backend-production.up.railway.app/download-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName }),
          });
          
          if (!res.ok) {
            continue;
          }

          const downloadResponse = await res.json();
          
          if (downloadResponse.ready && downloadResponse.downloadURL) {
            console.log(`✅ FOUND ${fileType.toUpperCase()} FILE: ${fileName}`);
            console.log(`✅ Download URL:`, downloadResponse.downloadURL);
            setUrl(downloadResponse.downloadURL);
            setFoundFilename(fileName);
            return true; // Found the file
          }
        } catch (error) {
          continue;
        }
      }
    }
    
    return false; // File not found
  };

  // Check for JSON file
  useEffect(() => {
    if (!file) return;
    let retryTimeout;
    
    const checkDownload = async () => {
      const found = await tryDownloadVariants('json', setDownloadUrl, (filename) => 
        setFoundFilenames(prev => ({ ...prev, json: filename }))
      );
      
      if (!found) {
        console.log("⏰ JSON file not found, retrying in 5 seconds...");
        retryTimeout = setTimeout(checkDownload, 5000);
      }
    };
    
    // Start checking after upload completes
    const initialTimeout = setTimeout(checkDownload, 3000);
    
    return () => {
      clearTimeout(retryTimeout);
      clearTimeout(initialTimeout);
    };
  }, [file]);

  // Check for CSV file
  useEffect(() => {
    if (!file) return;
    let retryTimeout;
    
    const checkDownload = async () => {
      const found = await tryDownloadVariants('csv', CSVsetDownloadUrl, (filename) => 
        setFoundFilenames(prev => ({ ...prev, csv: filename }))
      );
      
      if (!found) {
        console.log("⏰ CSV file not found, retrying in 5 seconds...");
        retryTimeout = setTimeout(checkDownload, 5000);
      }
    };
    
    // Start checking after upload completes
    const initialTimeout = setTimeout(checkDownload, 3000);
    
    return () => {
      clearTimeout(retryTimeout);
      clearTimeout(initialTimeout);
    };
  }, [file]);

  return (
    <div className="flex flex-col justify-center items-center h-dvh p-4">
      <div className="mx-auto mb-6">
        <h1 className="text-center text-9xl">🧑‍🍳</h1>
      </div>
      
      {/* Debug info */}
      <div className="mb-4 text-sm text-gray-600 text-center max-w-2xl">
        <p className="mb-2">Processing file: <span className="font-mono text-xs">{originalName}</span></p>
        <p>Searching with multiple base name patterns...</p>
      </div>

      {(downloadUrl || CSVdownloadUrl) ? (
        <div className="text-center">
          <div className="flex gap-4 mb-4">
            {downloadUrl && (
              <button
                onClick={() => handleDownload(downloadUrl, `maritime-data.json`)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors"
              >
                📄 Download JSON
              </button>
            )}
            {CSVdownloadUrl && (
              <button
                onClick={() => handleDownload(CSVdownloadUrl, `events.csv`)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors"
              >
                📊 Download CSV
              </button>
            )}
          </div>
          
          {/* Show found filenames */}
          <div className="text-xs text-gray-500 max-w-2xl break-all">
            {foundFilenames.json && <p>JSON: {foundFilenames.json}</p>}
            {foundFilenames.csv && <p>CSV: {foundFilenames.csv}</p>}
          </div>
        </div>
      ) : (
        <div className="text-center max-w-2xl">
          <h1 className="mb-4 font-bold text-xl">
            Your file is cooking! 🍳
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Searching for processed files... This may take a few minutes.
          </p>
          
          {/* Loading indicator */}
          <div className="flex justify-center items-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm">Searching...</span>
          </div>
          
          <div className="text-xs text-gray-500">
            <p className="mb-2">Looking for patterns like:</p>
            <p className="font-mono break-all">[filename]_extracted-claude-maritime-data-[timestamp].json</p>
            <p className="font-mono break-all">[filename]_extracted-claude-events-[timestamp].csv</p>
            <p className="mt-2 text-gray-400">⚠️ Check console for detailed search progress</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Download;