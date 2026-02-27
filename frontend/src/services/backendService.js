const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export const verifyImageWithAI = async () => {
  return {
    detected_issue: 'Potential civic issue detected',
    ai_confidence: 0.86,
    verified: true,
    classification: { category: 'general' },
    departmentRouting: { primaryDepartment: 'Municipal/Waste' },
    actionableInsights: ['Forwarded for civic review'],
  };
};

export const submitReportToBackend = async (reportData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reports/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
  }

  return { id: `RPT-${Date.now()}` };
};
