// ============================================
// NAGAR ALERT HUB - Storage Service
// S3 File Upload via Presigned URLs
// ============================================

const API_BASE_URL = import.meta.env.VITE_AWS_API_GATEWAY_URL || "";

/**
 * Get presigned URL from backend
 */
const getPresignedUrl = async (fileName, fileType) => {
    const params = new URLSearchParams({
        file_name: fileName,
        file_type: fileType,
    });

    console.log(`[getPresignedUrl] Requesting presigned URL for: ${fileName}`);

    const response = await fetch(`${API_BASE_URL}/get-presigned-url?${params}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to get presigned URL: ${response.status} - ${errText}`);
    }
    
    const data = await response.json();
    console.log(`[getPresignedUrl] Got response:`, data);
    return data;
};

/**
 * Upload file to S3 using presigned URL
 */
const uploadFile = async (file, folder) => {
    try {
        const fileName = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const fileType = file.type;

        console.log(`[uploadFile] Starting upload for: ${fileName}, type: ${fileType}, size: ${file.size}`);

        // 1. Get presigned URL from backend
        const presignedResponse = await getPresignedUrl(fileName, fileType);

        if (!presignedResponse || !presignedResponse.url) {
            throw new Error("Failed to get presigned URL");
        }

        console.log(`[uploadFile] Got presigned URL, bucket: ${presignedResponse.bucket}`);

        const { url, fields, bucket, region } = presignedResponse;

        // 2. Upload to S3
        if (fields) {
            // POST upload with form fields
            console.log(`[uploadFile] Using POST upload with form fields`);
            const formData = new FormData();
            Object.entries(fields).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append("file", file);

            const uploadRes = await fetch(url, {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                const errText = await uploadRes.text();
                throw new Error(`Upload failed: ${uploadRes.status} - ${errText}`);
            }
            
            // Return permanent S3 URL
            const s3Url = `https://${bucket}.s3.${region || 'ap-south-1'}.amazonaws.com/${fileName}`;
            console.log(`[uploadFile] Upload successful, URL: ${s3Url}`);
            return s3Url;
        } else {
            // PUT upload (direct presigned URL)
            console.log(`[uploadFile] Using PUT upload`);
            const uploadRes = await fetch(url, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": fileType,
                },
            });

            if (!uploadRes.ok) {
                const errText = await uploadRes.text();
                throw new Error(`Upload failed: ${uploadRes.status} - ${errText}`);
            }
            
            // Return permanent S3 URL (without query params)
            const baseUrl = url.split("?")[0];
            console.log(`[uploadFile] Upload successful, URL: ${baseUrl}`);
            return baseUrl;
        }
    } catch (error) {
        console.error("[uploadFile] Storage error:", error);
        throw error;
    }
};

/**
 * Upload image file
 */
export const uploadImage = async (file, folder = "images") => {
    if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image");
    }
    if (file.size > 10 * 1024 * 1024) {
        throw new Error("Image must be less than 10MB");
    }
    return uploadFile(file, folder);
};

/**
 * Upload video file
 */
export const uploadVideo = async (file, folder = "videos") => {
    if (!file.type.startsWith("video/")) {
        throw new Error("File must be a video");
    }
    if (file.size > 100 * 1024 * 1024) {
        throw new Error("Video must be less than 100MB");
    }
    return uploadFile(file, folder);
};

/**
 * Upload audio file
 */
export const uploadAudio = async (file, folder = "audio") => {
    if (!file.type.startsWith("audio/")) {
        throw new Error("File must be audio");
    }
    if (file.size > 25 * 1024 * 1024) {
        throw new Error("Audio must be less than 25MB");
    }
    return uploadFile(file, folder);
};

/**
 * Upload avatar image with base64
 */
export const uploadAvatarBase64 = async (userId, base64Data, filename) => {
    const response = await fetch(`${API_BASE_URL}/api/user/upload-avatar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        body: JSON.stringify({
            userId,
            imageBase64: base64Data,
            filename,
        }),
    });

    if (!response.ok) throw new Error("Avatar upload failed");
    return response.json();
};

/**
 * Convert file to base64
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

export default {
    uploadImage,
    uploadVideo,
    uploadAudio,
    uploadAvatarBase64,
    fileToBase64,
    getPresignedUrl,
};
