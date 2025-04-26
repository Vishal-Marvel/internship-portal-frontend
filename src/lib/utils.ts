import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import CryptoJS from "crypto-js";
import { Navigate } from "react-router-dom";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

export function encryptData(data: any): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}

export function decryptData(cipherText: string): any {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted);
}

export function logoutAndRedirect() {
  localStorage.removeItem("token");
  window.location.href = "/expired";
}
