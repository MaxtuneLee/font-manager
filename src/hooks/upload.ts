import { useState } from "react";
import { mutate } from "swr";

export const useUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<unknown>(null);
    const [successCount, setSuccessCount] = useState(0);
    const [errorCount, setErrorCount] = useState(0);
    const [fileCount, setFileCount] = useState(0);

    const upload = async (files: File[]) => {
        setUploading(true);
        setProgress(0);
        setErrorCount(0);
        setSuccessCount(0);
        setFileCount(files.length);
        setError(null);
        try {
            // upload file one by one
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                // 一个一个上传确保不会出错
                const res = await fetch("/api/font", {
                    method: "POST",
                    body: formData,
                });
                setProgress((prev) => prev + 1);
                const data = await res.json();
                if (data.message === "OK") {
                    setSuccessCount((prev) => prev + 1);
                } else {
                    setErrorCount((prev) => prev + 1);
                }
            }
            setUploading(false);
            mutate("/api/font");
            setTimeout(() => {
                setProgress(0);
                setSuccessCount(0);
                setErrorCount(0);
            }, 1500);
        } catch (error) {
            setUploading(false);
            setError(error);
        }
    };

    return {
        upload,
        uploading,
        progress,
        error,
        fileCount,
        successCount,
        errorCount,
    };
}