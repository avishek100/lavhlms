import { Skeleton } from "@/components/ui/skeleton";
import { initialSignInFormData } from "@/config";
import {
  changePasswordService,
  checkAuthService,
  loginService,
} from "@/services";
import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [auth, setAuth] = useState({
    authenticate: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  async function handleLoginUser(event) {
    event.preventDefault();
    try {
      const data = await loginService(signInFormData);
      if (data.success) {
        sessionStorage.setItem(
          "accessToken",
          JSON.stringify(data.data.accessToken)
        );
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
        toast.success(`Welcome back, ${data.data.user.userName}.`);
        return data.data.user;
      }

      setAuth({
        authenticate: false,
        user: null,
      });
      toast.error(data.message || "Unable to sign in. Please try again.");
      return false;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to sign in. Check your connection and try again."
      );
      return false;
    }
  }

  async function handleChangePassword(formData) {
    try {
      const data = await changePasswordService(formData);
      sessionStorage.setItem(
        "accessToken",
        JSON.stringify(data.data.accessToken)
      );
      setAuth({
        authenticate: true,
        user: data.data.user,
      });
      toast.success(data.message || "Password changed successfully.");
      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to change your password."
      );
      return false;
    }
  }

  //check auth user

  async function checkAuthUser() {
    if (!sessionStorage.getItem("accessToken")) {
      setAuth({
        authenticate: false,
        user: null,
      });
      setLoading(false);
      return;
    }

    try {
      const data = await checkAuthService();
      if (data.success) {
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
      } else {
        setAuth({
          authenticate: false,
          user: null,
        });
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        sessionStorage.removeItem("accessToken");
      } else {
        console.error("Unable to verify the current session:", error);
      }

      setAuth({
        authenticate: false,
        user: null,
      });
    } finally {
      setLoading(false);
    }
  }

  function resetCredentials() {
    sessionStorage.removeItem("accessToken");
    setAuth({
      authenticate: false,
      user: null,
    });
  }

  useEffect(() => {
    checkAuthUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signInFormData,
        setSignInFormData,
        handleLoginUser,
        handleChangePassword,
        auth,
        resetCredentials,
      }}
    >
      {loading ? <Skeleton /> : children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
