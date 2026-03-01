const API_BASE_URL = "http://localhost:8000/api";

export const submitReportToBackend = async (reportData) => {
    const response = await fetch(`${API_BASE_URL}/submit-report`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
    });
    if (!response.ok) throw new Error("Failed to submit report");
    return await response.json();
};

export const verifyImageWithAI = async (file) => {
    // Mock AI verification for now, or connect to a dedicated endpoint if exists
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                detected: "Pothole",
                confidence: 94,
                isReal: true
            });
        }, 2000);
    });
};
