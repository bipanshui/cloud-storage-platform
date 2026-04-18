import PropTypes from "prop-types";
import { createContext } from "react";
import { Toaster, toast } from "react-hot-toast";

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const value = {
    showSuccess(message) {
      toast.success(message);
    },
    showError(message) {
      toast.error(message);
    },
    showInfo(message) {
      toast(message);
    },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          className: "rounded-2xl border border-secondary-200 bg-white text-secondary-900 shadow-soft",
        }}
      />
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
