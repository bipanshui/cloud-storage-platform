import PropTypes from "prop-types";
import { Toaster } from "react-hot-toast";

function Toast({ position = "top-right" }) {
  return (
    <Toaster
      position={position}
      toastOptions={{
        duration: 3000,
      }}
    />
  );
}

Toast.propTypes = {
  position: PropTypes.string,
};

export default Toast;

