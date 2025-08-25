import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Download = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const storedFile = JSON.parse(localStorage.getItem("selectedFile"));
  const fileFromState = location.state?.selectedFiles?.[0];
  const file = fileFromState || storedFile;

  const [downloadUrl, setDownloadUrl] = useState(null);
  const [CSVdownloadUrl, CSVsetDownloadUrl] = useState(null);

  useEffect(() => {
    if (fileFromState) {
      localStorage.setItem("selectedFile", JSON.stringify(fileFromState));
    }
  }, [fileFromState]);

  if (!file) {
    return (
      <div className="flex flex-col justify-center items-center h-dvh">
        <h1 className="text-center mt-20 text-xl font-bold">
          No file selected. Please go back to upload page.
        </h1>
        <button
          onClick={() => navigate("/")}
          className="border border-black py-2 px-6 mt-4 rounded-2xl"
        >
          Go Back
        </button>
      </div>
    );
  }

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

  const originalName = file.name;
  const baseName = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
  const safeBaseName = baseName.replace(/\s+/g, "_");
  const extractedJsonName = `${safeBaseName}_extracted-events.json`;
  const extractedCsvName = `${safeBaseName}_extracted-events.csv`;

  useEffect(() => {
    if (!file) return;
    let retryTimeout;

    const fetchDownloadUrl = async (type) => {
      const fileName = `extracted-text/${type === "json" ? extractedJsonName : extractedCsvName}`;
      try {
        const res = await fetch("http://localhost:3000/download-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName }),
        });
        const { downloadURL } = await res.json();
        const { ready, downloadURL: signedUrl } = downloadURL || {};
        if (ready && signedUrl) {
          type === "json" ? setDownloadUrl(signedUrl) : CSVsetDownloadUrl(signedUrl);
        } else {
          retryTimeout = setTimeout(() => fetchDownloadUrl(type), 3000);
        }
      } catch {
        retryTimeout = setTimeout(() => fetchDownloadUrl(type), 3000);
      }
    };

    fetchDownloadUrl("json");
    fetchDownloadUrl("csv");

    return () => clearTimeout(retryTimeout);
  }, [file, extractedJsonName, extractedCsvName]);

  return (
    <div className="flex flex-col justify-center items-center h-dvh">
      <div className="mx-auto">
        <h1 className="text-center text-9xl">🧑‍🍳</h1>
      </div>

      {(downloadUrl || CSVdownloadUrl) ? (
        <div className="flex">
          {downloadUrl && (
            <button
              onClick={() => handleDownload(downloadUrl, extractedJsonName)}
              className="border border-black py-2 px-10 rounded-4xl m-4"
            >
              Download JSON
            </button>
          )}
          {CSVdownloadUrl && (
            <button
              onClick={() => handleDownload(CSVdownloadUrl, extractedCsvName)}
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
