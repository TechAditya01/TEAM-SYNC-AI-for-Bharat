import React, { createContext, useContext, useState, useEffect } from "react";
import {
  CognitoUserPool,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUser
} from "amazon-cognito-identity-js";

const AuthContext = createContext(null);

const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.getSession((err, session) => {
        if (err || !session.isValid()) {
          setUser(null);
          setLoading(false);
          return;
        }

        // 🔹 Get attributes for role
        currentUser.getUserAttributes((err, attributes) => {
          if (err) {
            setUser(null);
          } else {
            const userData = {};
            attributes.forEach(attr => {
              userData[attr.Name] = attr.Value;
            });
            setUser({ ...userData, sub: currentUser.username });
          }
          setLoading(false);
        });
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username: email, Pool: userPool });
      const authDetails = new AuthenticationDetails({ Username: email, Password: password });

      user.authenticateUser(authDetails, {
        onSuccess: (result) => {
          const payload = result.getIdToken().decodePayload();
          setUser({ ...payload, sub: payload.sub });
          resolve(payload);
        },
        onFailure: (err) => reject(err),
      });
    });
  };

  const logout = () => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
      setUser(null);
    }
  };

  const register = async (email, password, fullName, phone, role, extraData = {}) => {
    return new Promise((resolve, reject) => {
      const attributes = [
        new CognitoUserAttribute({ Name: "name", Value: fullName }),
        new CognitoUserAttribute({ Name: "custom:role", Value: role }),
      ];

      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      attributes.push(new CognitoUserAttribute({ Name: "phone_number", Value: formattedPhone }));

      userPool.signUp(email, password, attributes, null, async (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const sub = result.userSub;
          await fetch(`${import.meta.env.VITE_AWS_API_GATEWAY_URL}/api/save-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sub,
              email,
              role,
              firstName: extraData.firstName || fullName.split(" ")[0],
              lastName: extraData.lastName || fullName.split(" ")[1] || "",
              mobile: formattedPhone,
              city: extraData.city || null,
              address: extraData.address || null,
              department: extraData.department || null,
            }),
          });
          resolve(result.user);
        } catch (e) {
          reject(e);
        }
      });
    });
  };

  const verifyOtp = (email, otp) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
      cognitoUser.confirmRegistration(otp, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        // After confirmation, user can login
        resolve(result);
      });
    });
  };

  const loginWithToken = async (token) => {
    // This function would be used if implementing custom token-based login
    // For now, Cognito handles authentication automatically
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, verifyOtp, loginWithToken, loading, currentUser: user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
