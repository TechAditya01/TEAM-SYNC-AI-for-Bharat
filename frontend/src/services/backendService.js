// ============================================
// NAGAR ALERT HUB - Backend Service
// Smart Civic Intelligence Platform
// ============================================
// Complete API service for Admin & Citizen panels
// ============================================

const API_BASE_URL = import.meta.env.VITE_AWS_API_GATEWAY_URL || "";

// ============================================
// HELPER FUNCTIONS
// ============================================

const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem("accessToken");
    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Request failed" }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
};

// Get current user from localStorage
export const getCurrentUser = () => {
    const uid = localStorage.getItem("uid");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role") || "citizen";
    const accessToken = localStorage.getItem("accessToken");

    if (!uid || !accessToken) return null;

    return { uid, name, email, role, accessToken };
};

// ============================================
// AUTHENTICATION (Both Admin & Citizen)
// ============================================

export const saveUser = async (userData) => {
    return apiCall("/api/save-user", {
        method: "POST",
        body: JSON.stringify(userData),
    });
};

export const sendOtp = async (email) => {
    return apiCall("/api/send-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
    });
};

export const verifyOtp = async (email, otp) => {
    const result = await apiCall("/api/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
    });

    // Store tokens in localStorage
    if (result.accessToken) {
        localStorage.setItem("accessToken", result.accessToken);
        localStorage.setItem("refreshToken", result.refreshToken || "");
        localStorage.setItem("uid", result.userId || result.sub);
        localStorage.setItem("email", email);
        localStorage.setItem("role", result.role || "citizen");
        if (result.name) localStorage.setItem("name", result.name);
    }

    return result;
};

export const forgotPassword = async (email) => {
    return apiCall("/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
    });
};

export const confirmPassword = async (email, confirmationCode, newPassword) => {
    return apiCall("/confirm-password", {
        method: "POST",
        body: JSON.stringify({ email, confirmationCode, newPassword }),
    });
};

export const getAuthMe = async () => {
    return apiCall("/api/auth/me", { method: "GET" });
};

export const joinCommunity = async (communityId, role = "citizen") => {
    return apiCall("/api/auth/join-community", {
        method: "POST",
        body: JSON.stringify({ communityId, role }),
    });
};

export const registerAdmin = async (adminData) => {
    return apiCall("/api/admin/register", {
        method: "POST",
        body: JSON.stringify(adminData),
    });
};

export const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("uid");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    window.location.href = "/login";
};

// ============================================
// STORAGE & FILE UPLOAD
// ============================================

export const getPresignedUrl = async (filename, contentType) => {
    const params = new URLSearchParams({
        file_name: filename,
        file_type: contentType
    });
    return apiCall(`/get-presigned-url?${params}`, { method: "GET" });
};

export const uploadFileToS3 = async (presignedUrl, file, fields = {}) => {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
    });
    formData.append("file", file);

    const response = await fetch(presignedUrl, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) throw new Error("Failed to upload file");
    return true;
};

// ============================================
// CITIZEN - REPORTS
// ============================================

export const submitReportToBackend = async (reportData) => {
    const userId = localStorage.getItem("uid");
    const userName = localStorage.getItem("name") || "Citizen";

    return apiCall("/submit-report", {
        method: "POST",
        body: JSON.stringify({
            ...reportData,
            userId,
            userName,
            timestamp: Date.now(),
        }),
    });
};

export const createReport = async (reportData) => {
    const userId = localStorage.getItem("uid");
    const userName = localStorage.getItem("name") || "Citizen";

    return apiCall("/api/reports/create", {
        method: "POST",
        body: JSON.stringify({
            ...reportData,
            userId,
            userName,
            timestamp: Date.now(),
            status: reportData.status || "Pending",
        }),
    });
};

export const getReportById = async (report_id) => {
    return apiCall(`/api/reports/${report_id}`, { method: "GET" });
};

export const getUserReports = async (userId) => {
    const uid = userId || localStorage.getItem("uid");
    return apiCall(`/api/reports/user/${uid}`, { method: "GET" });
};

export const getMyReports = async (userSub) => {
    const uid = userSub || localStorage.getItem("uid");
    return apiCall(`/api/my-reports/${uid}`, { method: "GET" });
};

// ============================================
// CITIZEN - PROFILE & USER DATA
// ============================================

export const getUserById = async (userId) => {
    const uid = userId || localStorage.getItem("uid");
    return apiCall(`/api/user/${uid}`, { method: "GET" });
};

export const updateUserProfile = async (userId, profileData) => {
    return apiCall(`/api/user/${userId}/update`, {
        method: "POST",
        body: JSON.stringify(profileData),
    });
};

export const uploadAvatar = async (userId, imageBase64, filename) => {
    return apiCall("/api/user/upload-avatar", {
        method: "POST",
        body: JSON.stringify({ userId, imageBase64, filename }),
    });
};

// ============================================
// CITIZEN - ACHIEVEMENTS & LEADERBOARD
// ============================================

export const getUserAchievements = async (userId) => {
    const uid = userId || localStorage.getItem("uid");
    return apiCall(`/api/user/${uid}/achievements`, { method: "GET" });
};

export const getLeaderboard = async (filter = "weekly", municipality = "") => {
    const params = new URLSearchParams({ filter, municipality });
    return apiCall(`/api/leaderboard?${params}`, { method: "GET" });
};

export const getUserPoints = async (userId) => {
    const uid = userId || localStorage.getItem("uid");
    return apiCall(`/api/user/${uid}/points`, { method: "GET" });
};

// ============================================
// CITIZEN - NOTIFICATIONS
// ============================================

export const getUserNotifications = async (userId) => {
    const uid = userId || localStorage.getItem("uid");
    return apiCall(`/api/user/${uid}/notifications`, { method: "GET" });
};

export const markNotificationRead = async (notificationId) => {
    return apiCall(`/api/notifications/${notificationId}/read`, {
        method: "POST",
    });
};

export const markAllNotificationsRead = async (userId) => {
    const uid = userId || localStorage.getItem("uid");
    return apiCall(`/api/user/${uid}/notifications/read-all`, {
        method: "POST",
    });
};

// ============================================
// CITIZEN - SOS EMERGENCY
// ============================================

export const sendSOSAlert = async (location, message = "") => {
    const userId = localStorage.getItem("uid");
    const userName = localStorage.getItem("name") || "Citizen";

    return apiCall("/api/reports/create", {
        method: "POST",
        body: JSON.stringify({
            userId,
            userName,
            type: "SOS Emergency",
            description: message || "User activated Emergency SOS beacon. Immediate assistance required.",
            department: "Police",
            priority: "Critical",
            status: "Pending",
            location,
            timestamp: Date.now(),
            isSOS: true,
        }),
    });
};

// ============================================
// ADMIN - DASHBOARD & ANALYTICS
// ============================================

export const getDashboardStats = async (municipality) => {
    const params = municipality ? `?municipality=${encodeURIComponent(municipality)}` : "";
    return apiCall(`/api/dashboard${params}`, { method: "GET" });
};

export const getAllReports = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.category) params.append("category", filters.category);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.municipality) params.append("municipality", filters.municipality);
    if (filters.department) params.append("department", filters.department);
    if (filters.adminSub) params.append("adminSub", filters.adminSub);
    if (filters.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const result = await apiCall(`/api/dashboard${queryString ? `?${queryString}` : ""}`, { method: "GET" });

    // Fallback frontend filter for new unknown departments not in AWS backend map yet
    let reports = Array.isArray(result) ? result : (result.reports || []);

    if (filters.department) {
        const myDept = filters.department.toLowerCase();
        const deptMap = {
            'fire': ['fire', 'fire accident', 'fire hazard'],
            'fire department': ['fire', 'fire accident', 'fire hazard'],
            'sanitation': ['garbage', 'waste', 'litter', 'sanitation', 'drainage', 'sewage'],
            'water': ['water leak', 'water', 'flooding', 'flood'],
            'electricity': ['electricity', 'power', 'streetlight', 'electric'],
            'roads': ['pothole', 'road', 'traffic', 'road damage'],
            'health': ['health', 'hospital', 'medical'],
            'police': ['crime', 'accident', 'sos', 'violence', 'theft'],
        };
        const allowedTypes = deptMap[myDept] || [];

        reports = reports.filter(r => {
            const rType = (r.type || r.category || "").toLowerCase();
            const rDept = (r.department || "").toLowerCase();
            return (rDept === myDept || allowedTypes.includes(rType));
        });
    }

    return Array.isArray(result) ? reports : { ...result, reports };
};

export const getReportsByStatus = async (status) => {
    return apiCall(`/api/reports/status/${status}`, { method: "GET" });
};

export const getAnalyticsData = async (municipality, dateRange = "week") => {
    const params = new URLSearchParams({ dateRange });
    if (municipality) params.append("municipality", municipality);
    return apiCall(`/api/analytics?${params}`, { method: "GET" });
};

// ============================================
// ADMIN - INCIDENT MANAGEMENT
// ============================================

export const updateReportStatus = async (report_id, status, comment = "", assignedTo = "") => {
    return apiCall("/api/update-status", {
        method: "POST",
        body: JSON.stringify({
            report_id,
            status,
            comment,
            assignedTo,
            updatedAt: Date.now(),
            updatedBy: localStorage.getItem("uid"),
        }),
    });
};

export const assignReportToDepartment = async (report_id, department, assignedTo) => {
    return apiCall("/api/update-status", {
        method: "POST",
        body: JSON.stringify({
            report_id,
            department,
            assignedTo,
            status: "Assigned",
            updatedAt: Date.now(),
        }),
    });
};

export const resolveReport = async (report_id, resolutionNote) => {
    return apiCall("/api/update-status", {
        method: "POST",
        body: JSON.stringify({
            report_id,
            status: "Resolved",
            comment: resolutionNote,
            resolvedAt: Date.now(),
            resolvedBy: localStorage.getItem("uid"),
        }),
    });
};

// ============================================
// ADMIN - BROADCAST & ALERTS
// ============================================

export const broadcastAlert = async (alertData) => {
    const sender = localStorage.getItem("name") || "Admin";

    return apiCall("/api/broadcast", {
        method: "POST",
        body: JSON.stringify({
            ...alertData,
            sender,
            timestamp: Date.now(),
        }),
    });
};

export const getAlertHistory = async (municipality, limit = 20) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (municipality) params.append("municipality", municipality);
    return apiCall(`/api/alerts/history?${params}`, { method: "GET" });
};

export const deleteAlert = async (alertId) => {
    return apiCall(`/api/alerts/${alertId}`, { method: "DELETE" });
};

// ============================================
// ADMIN - OFFICER PROFILE
// ============================================

export const getOfficerProfile = async (officerId) => {
    const uid = officerId || localStorage.getItem("uid");
    return apiCall(`/api/officer/${uid}`, { method: "GET" });
};

export const updateOfficerProfile = async (officerId, profileData) => {
    return apiCall(`/api/officer/${officerId}/update`, {
        method: "POST",
        body: JSON.stringify(profileData),
    });
};

// ============================================
// ADMIN - TASK MANAGEMENT
// ============================================

export const getTasks = async (department) => {
    const params = department ? `?department=${encodeURIComponent(department)}` : "";
    return apiCall(`/api/tasks${params}`, { method: "GET" });
};

export const createTask = async (taskData) => {
    return apiCall("/api/tasks/create", {
        method: "POST",
        body: JSON.stringify({
            ...taskData,
            createdAt: Date.now(),
            createdBy: localStorage.getItem("uid"),
            status: "Todo",
        }),
    });
};

export const updateTaskStatus = async (taskId, status) => {
    return apiCall(`/api/tasks/${taskId}/status`, {
        method: "POST",
        body: JSON.stringify({ status, updatedAt: Date.now() }),
    });
};

export const deleteTask = async (taskId) => {
    return apiCall(`/api/tasks/${taskId}`, { method: "DELETE" });
};

export const assignTask = async (taskData) => {
    return apiCall("/api/tasks/assign", {
        method: "POST",
        body: JSON.stringify({
            ...taskData,
            assignedAt: Date.now(),
            assignedBy: localStorage.getItem("uid"),
        }),
    });
};

export const getOfficers = async (department, municipality) => {
    const params = new URLSearchParams();
    if (department) params.append("department", department);
    if (municipality) params.append("municipality", municipality);
    const queryString = params.toString();
    return apiCall(`/api/officers${queryString ? `?${queryString}` : ""}`, { method: "GET" });
};

// ============================================
// ADMIN - NOTIFICATIONS
// ============================================

export const getAdminNotifications = async () => {
    const uid = localStorage.getItem("uid");
    return apiCall(`/api/admin/${uid}/notifications`, { method: "GET" });
};

export const createNotification = async (notificationData) => {
    return apiCall("/api/notifications/create", {
        method: "POST",
        body: JSON.stringify({
            ...notificationData,
            createdAt: Date.now(),
            createdBy: localStorage.getItem("uid"),
        }),
    });
};

// ============================================
// COMMUNITIES & MUNICIPALITIES
// ============================================

export const getCommunities = async (type, state) => {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (state) params.append("state", state);
    const queryString = params.toString();
    return apiCall(`/api/communities${queryString ? `?${queryString}` : ""}`, { method: "GET" });
};

// ============================================
// AI VERIFICATION (Amazon Bedrock Powered)
// ============================================

export const verifyImageWithAI = async (file, reportType = "", location = null) => {
    // Convert file to base64
    const base64 = await fileToBase64(file);

    console.log("Calling AI verify-image API...");

    const result = await apiCall("/api/ai/verify-image", {
        method: "POST",
        body: JSON.stringify({
            imageBase64: base64,
            reportType,
            location,
        }),
    });

    console.log("AI verify-image response:", result);
    return result;
};

export const verifyVideoWithAI = async (file, reportType = "", location = null, mode = "quick") => {
    try {
        const base64 = await fileToBase64(file);

        return await apiCall("/api/ai/verify-video", {
            method: "POST",
            body: JSON.stringify({
                videoBase64: base64,
                reportType,
                location,
                mode, // "quick" or "full"
            }),
        });
    } catch (error) {
        console.warn("Video AI verification API not available");
        return {
            verified: false,
            error: "Video verification not available",
            analysisMode: mode,
        };
    }
};

export const verifyVoiceWithAI = async (file, reportType = "", location = null, mode = "sync") => {
    try {
        const base64 = await fileToBase64(file);

        return await apiCall("/api/ai/verify-voice", {
            method: "POST",
            body: JSON.stringify({
                audioBase64: base64,
                reportType,
                location,
                mode, // "sync" or "async"
            }),
        });
    } catch (error) {
        console.warn("Voice AI verification API not available");
        return {
            status: "error",
            verified: false,
            error: "Voice verification not available",
        };
    }
};

export const checkVoiceTranscriptionStatus = async (jobId) => {
    try {
        return await apiCall("/api/ai/verify-voice", {
            method: "POST",
            body: JSON.stringify({ jobId }),
        });
    } catch (error) {
        return { status: "error", error: error.message };
    }
};

export const analyzeTextSentiment = async (text, includeTranslation = true) => {
    try {
        return await apiCall("/api/ai/analyze-text", {
            method: "POST",
            body: JSON.stringify({ text, translate: includeTranslation }),
        });
    } catch {
        // Mock response
        return {
            sentiment: { label: "NEUTRAL", score: 50 },
            urgency: { level: "Medium", score: 50 },
            detectedIssueType: "Other",
            aiModel: "Mock (Bedrock unavailable)",
        };
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

// ============================================
// REAL-TIME UPDATES (WebSocket - Future)
// ============================================

export const subscribeToUpdates = (report_id, callback) => {
    // TODO: Implement WebSocket connection for real-time updates
    console.log(`Subscribing to updates for report: ${report_id}`);

    // Mock polling for now
    const interval = setInterval(async () => {
        try {
            const report = await getReportById(report_id);
            callback(report);
        } catch (e) {
            console.error("Update poll failed", e);
        }
    }, 30000);

    return () => clearInterval(interval);
};

export const subscribeToAlerts = (municipality, callback) => {
    // TODO: Implement WebSocket for real-time alerts
    console.log(`Subscribing to alerts for: ${municipality}`);

    const interval = setInterval(async () => {
        try {
            const alerts = await getAlertHistory(municipality, 5);
            callback(alerts);
        } catch (e) {
            console.error("Alert poll failed", e);
        }
    }, 60000);

    return () => clearInterval(interval);
};

// ============================================
// EXPORT DEFAULT FOR CONVENIENCE
// ============================================

export default {
    // Auth
    saveUser,
    sendOtp,
    verifyOtp,
    forgotPassword,
    confirmPassword,
    getAuthMe,
    joinCommunity,
    logout,
    getCurrentUser,

    // Reports
    submitReportToBackend,
    createReport,
    getReportById,
    getUserReports,
    getMyReports,

    // User
    getUserById,
    updateUserProfile,
    uploadAvatar,
    getUserAchievements,
    getLeaderboard,
    getUserPoints,
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead,

    // SOS
    sendSOSAlert,

    // Admin Dashboard
    getDashboardStats,
    getAllReports,
    getAnalyticsData,

    // Admin Incidents
    updateReportStatus,
    assignReportToDepartment,
    resolveReport,

    // Admin Alerts
    broadcastAlert,
    getAlertHistory,
    deleteAlert,

    // Admin Officer
    getOfficerProfile,
    updateOfficerProfile,

    // Admin Tasks
    getTasks,
    createTask,
    updateTaskStatus,
    deleteTask,
    getAdminNotifications,

    // AI
    verifyImageWithAI,
    analyzeTextSentiment,

    // Storage
    getPresignedUrl,
    uploadFileToS3,

    // Real-time
    subscribeToUpdates,
    subscribeToAlerts,
};
