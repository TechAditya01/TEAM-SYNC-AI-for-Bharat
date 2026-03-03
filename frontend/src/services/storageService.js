const API_BASE_URL = import.meta.env.VITE_AWS_API_GATEWAY_URL || "";

const uploadFile = async (file, folder) => {
    try {
        const fileName = `${folder}/${Date.now()}-${file.name}`;
        const fileType = file.type;

        // 1. Get presigned URL
        const resUrl = await fetch(`${API_BASE_URL}/get-presigned-url?file_name=${fileName}&file_type=${fileType}`);
        const presignedResponse = await resUrl.json();

        if (!presignedResponse || !presignedResponse.url) {
            throw new Error("Failed to get presigned URL");
        }

        const { url, fields } = presignedResponse;
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, value);
        });
        formData.append("file", file);

        // 2. Upload to S3
        const uploadRes = await fetch(url, {
            method: "POST",
            body: formData,
        });

        if (!uploadRes.ok) throw new Error("Upload failed");

        return `${url}/${fileName}`;
    } catch (error) {
        console.error("Storage error:", error);
        throw error;
    }
};

export const uploadImage = (file, folder) => uploadFile(file, folder);
export const uploadVideo = (file, folder) => uploadFile(file, folder);
export const uploadAudio = (file, folder) => uploadFile(file, folder);
