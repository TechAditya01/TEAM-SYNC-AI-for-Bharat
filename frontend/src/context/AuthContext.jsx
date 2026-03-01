import React, { createContext, useContext } from "react";
import {
  CognitoUserPool,
  CognitoUserAttribute
} from "amazon-cognito-identity-js";

const AuthContext = createContext(null);

// Cognito config
const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);

export function AuthProvider({ children }) {

  // ================= REGISTER =================
  const register = async (
    email,
    password,
    fullName,
    phone,
    role,
    extraData = {}
  ) => {
    return new Promise((resolve, reject) => {

      const attributes = [];

      attributes.push(
        new CognitoUserAttribute({
          Name: "name",
          Value: fullName,
        })
      );

      const formattedPhone = phone.startsWith("+")
        ? phone
        : `+91${phone}`;

      attributes.push(
        new CognitoUserAttribute({
          Name: "phone_number",
          Value: formattedPhone,
        })
      );

      userPool.signUp(
        email,
        password,
        attributes,
        null,
        async (err, result) => {
          if (err) {
            console.error("Cognito signup error:", err);
            reject(err);
            return;
          }

          try {
            const sub = result.userSub;

            // 🔹 SAVE TO BACKEND → DynamoDB
           await fetch("http://localhost:8000/api/save-user", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    sub,
    email,
    role,
    firstName:
      extraData.firstName || fullName.split(" ")[0],
    lastName:
      extraData.lastName || fullName.split(" ")[1] || "",
    mobile: formattedPhone,
    city: extraData.city || null,
    address: extraData.address || null,
    department: extraData.department || null,
  }),
});

            resolve(result.user);

          } catch (e) {
            console.error("Save user error:", e);
            reject(e);
          }
        }
      );
    });
  };

  return (
    <AuthContext.Provider value={{ register }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ MUST EXPORT
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};