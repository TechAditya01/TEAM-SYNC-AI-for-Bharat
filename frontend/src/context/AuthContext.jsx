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
      currentUser.getSession(async (err, session) => {
        if (err || !session.isValid()) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Get Cognito attributes
        currentUser.getUserAttributes(async (err, attributes) => {
          if (err) {
            setUser(null);
            setLoading(false);
            return;
          }

          const userData = {};
          attributes.forEach(attr => {
            userData[attr.Name] = attr.Value;
          });

          let role = 'citizen';
          let department = null;
          let municipality = null;

          // Fetch role from backend (DynamoDB)
          try {
            // Use AccessToken for Cognito get_user API (not IdToken)
            const accessToken = session.getAccessToken().getJwtToken();
            const res = await fetch(`${import.meta.env.VITE_AWS_API_GATEWAY_URL}/api/auth/me`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (res.ok) {
              const resData = await res.json();
              // API returns { user: {...} } or {...} directly depending on the backend route implementation
              const backendUser = resData.user || resData;

              role = (backendUser.role || 'citizen').toLowerCase();
              department = backendUser.department || null;
              municipality = backendUser.municipality || null;
            }
          } catch (e) {
            console.error('Failed to fetch user backend role:', e);
          }

          const userObj = {
            ...userData,
            sub: currentUser.username,
            role,
            department,
            municipality
          };

          setUser(userObj);
          // Persist uid so components can read it from localStorage
          localStorage.setItem('uid', currentUser.username);
          localStorage.setItem('userRole', userData.role || 'citizen');
          setLoading(false);
        });
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (email, password, userType) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
      const authDetails = new AuthenticationDetails({ Username: email, Password: password });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: async (result) => {
          const payload = result.getIdToken().decodePayload();
          // Use AccessToken for Cognito get_user API
          const accessToken = result.getAccessToken().getJwtToken();

          // Fetch role from backend (DynamoDB)
          let role = userType || 'citizen';
          let department = null;
          let municipality = null;
          try {
            const res = await fetch(`${import.meta.env.VITE_AWS_API_GATEWAY_URL}/api/auth/me`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (res.ok) {
              const resData = await res.json();
              const backendUser = resData.user || resData;
              role = (backendUser.role || role).toLowerCase();
              department = backendUser.department || null;
              municipality = backendUser.municipality || null;
            }
          } catch (e) {
            console.log('Could not fetch role from backend:', e);
          }

          const userObj = { ...payload, sub: payload.sub, role, department, municipality };
          setUser(userObj);
          // Persist uid so components can read it from localStorage
          localStorage.setItem('uid', payload.sub);
          localStorage.setItem('userRole', role);
          resolve(userObj);
        },
        onFailure: (err) => reject(err),
      });
    });
  };

  const logout = () => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
    }
    setUser(null);
    localStorage.removeItem('uid');
    localStorage.removeItem('userRole');
  };

  const register = async (email, password, fullName, phone, role, extraData = {}) => {
    return new Promise((resolve, reject) => {
      // Format phone to E.164 format (+91XXXXXXXXXX)
      let formattedPhone = phone.trim();
      
      // Remove all non-digit characters
      formattedPhone = formattedPhone.replace(/\D/g, '');
      
      // If less than 10 digits, it's invalid
      if (formattedPhone.length < 10) {
        reject(new Error("Phone number must be at least 10 digits"));
        return;
      }
      
      // Take last 10 digits if more than 10
      if (formattedPhone.length > 10) {
        formattedPhone = formattedPhone.slice(-10);
      }
      
      // Add +91 prefix
      formattedPhone = "+91" + formattedPhone;
      
      console.log(`Formatted phone: ${formattedPhone}`);
      console.log(`Registering with email: ${email}, name: ${fullName}, role: ${role}`);
      
      // Only add standard Cognito attributes
      const attributes = [
        new CognitoUserAttribute({ Name: "name", Value: fullName }),
        new CognitoUserAttribute({ Name: "phone_number", Value: formattedPhone }),
      ];

      userPool.signUp(email, password, attributes, null, async (err, result) => {
        if (err) {
          console.error("❌ Cognito SignUp Error:", err);
          console.error("Error code:", err.code);
          console.error("Error message:", err.message);
          console.error("Full error:", JSON.stringify(err, null, 2));
          
          // Debug: Log what we're sending to Cognito
          console.log("📤 SENT TO COGNITO:");
          console.log("  Email:", email);
          console.log("  Password Length:", password.length);
          console.log("  Name:", fullName);
          console.log("  Phone:", formattedPhone);
          console.log("  Attributes:", attributes.map(attr => ({ Name: attr.Name, Value: attr.Value })));
          console.log("  User Pool ID:", poolData.UserPoolId);
          console.log("  Client ID:", poolData.ClientId);
          
          // Provide user-friendly error messages based on error code
          let friendlyMessage = "Registration failed. ";
          switch(err.code) {
            case 'UsernameExistsException':
              friendlyMessage = "An account with this email already exists. Please login instead.";
              break;
            case 'InvalidPasswordException':
              friendlyMessage = "Password is too weak. Must be at least 8 characters with uppercase, lowercase, number, and special character.";
              break;
            case 'InvalidParameterException':
              friendlyMessage = "Invalid email or phone number format. Please check your input.";
              break;
            case 'NotAuthorizedException':
              friendlyMessage = "Not authorized to register. Please check your credentials.";
              break;
            case 'ResourceNotFoundException':
              friendlyMessage = "Cognito service not found. Please contact support.";
              break;
            case 'TooManyRequestsException':
              friendlyMessage = "Too many registration attempts. Please try again later.";
              break;
            default:
              friendlyMessage = err.message || "Registration failed. Please try again.";
          }
          
          reject(new Error(friendlyMessage));
          return;
        }

        try {
          const sub = result.userSub;
          console.log("Cognito user created, sub:", sub);
          
          const saveUserResponse = await fetch(`${import.meta.env.VITE_AWS_API_GATEWAY_URL}/api/save-user`, {
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
              lat: extraData.lat || null,
              lng: extraData.lng || null,
            }),
          });
          
          if (!saveUserResponse.ok) {
            const errorData = await saveUserResponse.json();
            console.error("Save user failed:", errorData);
            throw new Error(`Failed to save user: ${errorData.error || 'Unknown error'}`);
          }
          
          const saveData = await saveUserResponse.json();
          console.log("User data saved successfully:", saveData);
          resolve(result.user);
        } catch (e) {
          console.error("Save user error:", e);
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
