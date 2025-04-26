import { useEffect, useState } from "react";
import { SessionContext } from "@/providers/context/SessionContext";
import { redirect, useLocation, useNavigate } from "react-router-dom";
import { Theme, ThemeProvider, useTheme } from "./theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ModalProvider } from "./model-provider";

export const publicRoutes = ["/student/signin", "/", "/forgetpass", "/expired"];

export const facultyRoutes = [
  "/faculties",
  "/students",
  "/studentInternships",
  "/skills",
  "/faculty/signin",
];

export function Providers({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [clg, setClg] = useState<Theme | null>(null);

  useEffect(() => {
    isTokenExpired();
    if (!token && !publicRoutes.includes(pathname)) {
      setTheme("default");
      navigate("/");
    }
    if (pathname == "/") {
      if (token) navigate("/dashboard");
    }

    if (facultyRoutes.includes(pathname) && role?.includes("student")) {
      setTheme("default");

      navigate("/");
    }
    setTheme(clg);
  }, [pathname, token]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      const val = JSON.parse(atob(storedToken.split(".")[1]));
      //@ts-ignore
      setClg(val.clg);

      setRole(val.roles);
    }
  }, [pathname]);

  const setSession = (newToken: string, newRole: string, newClg: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setRole(newRole);
    //@ts-ignore
    setClg(newClg);
  };

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("portal-theme")
    setToken(null);
    setClg(null);
    setRole(null);
    redirect("/");
  };

  const isTokenExpired = () => {
    if (token) {
      let exp;

      try {
        exp = JSON.parse(atob(token.split(".")[1]));
      } catch (e) {
        return null;
      }
      if (exp.exp * 1000 < Date.now()) {
        clearSession();
        return true;
      }
      return false;
    }
    return true;
  };
  return (
    <SessionContext.Provider
      value={{
        token,
        role,
        isTokenExpired,
        clearSession,
        setSession,
      }}
    >
      <Toaster position="top-right" />

      <ThemeProvider defaultTheme="default">
        <ModalProvider />
        {children}
      </ThemeProvider>
    </SessionContext.Provider>
  );
}
