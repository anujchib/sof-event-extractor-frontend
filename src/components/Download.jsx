import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Download = () => {
  const location = useLocation();
  const data = location.state;
  const fileList = data?.selectedFiles;
  const file = fileList?.[0];

  const [downloadUrl, setDownloadUrl] = useState(null);
  const [CSVdownloadUrl, CSVsetDownloadUrl] = useState(null);

  const handleDownload = async (url, fileName) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed ❌", error);
    }
  };

  useEffect(() => {
    if (!file) return;

    const uploadFile = async () => {
      try {
        const upload = await fetch("http://localhost:3000/upload-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

        if (s3Upload.ok) {
          console.log("File uploaded successfully ✅");
        }
      } catch (error) {
        console.error("Upload error ❌", error);
      }
    };

    uploadFile();
  }, [file]);

  const originalName = file?.name || "";
  const baseName =
    originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
  const safeBaseName = baseName.replace(/\s+/g, "_");
  const extractedName = `${safeBaseName}_extracted-events.json`;

  useEffect(() => {
    if (!file) return;
    let retryTimeout;

    const checkDownload = async () => {
      try {
        const res = await fetch("http://localhost:3000/download-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: `extracted-text/${extractedName}` }),
        });

        const downloadResponse = await res.json();
        const { downloadURL } = downloadResponse;
        const { ready, downloadURL: signedUrl } = downloadURL || {};

        if (ready && signedUrl) {
          setDownloadUrl(signedUrl);
        } else {
          retryTimeout = setTimeout(checkDownload, 3000);
        }
      } catch (error) {
        retryTimeout = setTimeout(checkDownload, 3000);
      }
    };

    checkDownload();
    return () => clearTimeout(retryTimeout);
  }, [file, extractedName]);

  const CSVextractedName = `${safeBaseName}_extracted-events.csv`;

  useEffect(() => {
    if (!file) return;
    let retryTimeout;

    const checkDownload = async () => {
      try {
        const res = await fetch("http://localhost:3000/download-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: `extracted-text/${CSVextractedName}` }),
        });

        const downloadResponse = await res.json();
        const { downloadURL } = downloadResponse;
        const { ready, downloadURL: signedUrl } = downloadURL || {};

        if (ready && signedUrl) {
          CSVsetDownloadUrl(signedUrl);
        } else {
          retryTimeout = setTimeout(checkDownload, 3000);
        }
      } catch (error) {
        retryTimeout = setTimeout(checkDownload, 3000);
      }
    };

    checkDownload();
    return () => clearTimeout(retryTimeout);
  }, [file, CSVextractedName]);

  return (
    <div className="flex flex-col justify-center items-center h-dvh">
      <div className="mx-auto">
        <h1 className="text-center text-9xl">🧑‍🍳</h1>
      </div>

      {(downloadUrl || CSVdownloadUrl) ? (
        <div className="flex">
          {downloadUrl && (
            <button
              onClick={() => handleDownload(downloadUrl, extractedName)}
              className="border border-black py-2 px-10 rounded-4xl m-4"
            >
              Download JSON
            </button>
          )}

          {CSVdownloadUrl && (
            <button
              onClick={() => handleDownload(CSVdownloadUrl, CSVextractedName)}
              className="border border-black py-2 px-10 rounded-4xl m-4"
            >
              Download CSV
            </button>
          )}
        </div>
      ) : (
        <h1 className="m-10 font-bold text-xl">
          Your file is cooking, download button will appear here soon!
        </h1>
      )}
    </div>
  );
};

export default Download;
