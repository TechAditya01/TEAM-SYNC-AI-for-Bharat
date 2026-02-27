const apps = [];

export const initializeApp = (config = {}) => {
  const app = { config, name: 'mock-app' };
  apps.push(app);
  return app;
};

export const getApps = () => apps;

export const getApp = () => apps[0] || initializeApp();
