import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Download = () => {
  const location = useLocation();
  const data = location.state;
  const fileList = data?.selectedFiles;
  const file = fileList?.[0];

  const [downloadUrl, setDownloadUrl] = useState(null);

 
  useEffect(() => {
    if (!file) return;

    const uploadFile = async () => {
      console.log("Uploading started 📈");

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

        console.log("S3 Upload status 📊", s3Upload.status);

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

  console.log("Expected extracted file name:", extractedName);

  useEffect(() => {
    if (!file) return;

    let retryTimeout;

    const checkDownload = async () => {
      console.log("Fetching Download Content...");

      try {
        const res = await fetch("http://localhost:3000/download-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: `extracted-text/${extractedName}` }),
        });

        const downloadResponse = await res.json();
        const { ready, downloadURL } = downloadResponse;

        console.log("Server returned signed URL:", downloadURL);

        if (ready && downloadURL) {
          setDownloadUrl(downloadURL);
          console.log("✅ State updated with signed URL:", downloadURL);
        } else {
          retryTimeout = setTimeout(checkDownload, 3000);
        }
      } catch (error) {
        console.error("Polling error ❌", error);
        retryTimeout = setTimeout(checkDownload, 3000);
      }
    };

    checkDownload();

    return () => clearTimeout(retryTimeout);
  }, [file, extractedName]);


  return (
    <div className="flex flex-col justify-center items-center h-dvh">
      <div className="mx-auto">
        <h1 className="text-center text-9xl">🧑‍🍳</h1>
      </div>

      {downloadUrl ? (
        <div className="flex">
          <button
            onClick={() => window.open(downloadUrl)}
            className="border border-black py-2 px-10 rounded-4xl m-4"
          >
            Download
          </button>
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
