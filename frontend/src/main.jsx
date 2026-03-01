import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider as OIDCProvider } from "react-oidc-context";
import { AuthProvider as CustomAuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import "./index.css";

const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  response_type: "code",
  scope: import.meta.env.VITE_COGNITO_SCOPE,
  post_logout_redirect_uri: import.meta.env.VITE_COGNITO_LOGOUT_URI
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <OIDCProvider {...cognitoAuthConfig}>
      <CustomAuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </ThemeProvider>
      </CustomAuthProvider>
    </OIDCProvider>
  </React.StrictMode>
);