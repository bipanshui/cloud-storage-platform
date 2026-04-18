import { useContext } from "react";
import { FileContext } from "@/context/FileContext";

export function useFile() {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFile must be used within a FileProvider");
  }
  return context;
}