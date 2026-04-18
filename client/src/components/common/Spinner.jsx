import clsx from "clsx";
import PropTypes from "prop-types";

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
};

function Spinner({ size = "md", color = "border-primary-500" }) {
  return (
    <span
      className={clsx(
        "inline-block animate-spin rounded-full border-solid border-r-transparent",
        sizeClasses[size],
        color
      )}
      aria-hidden="true"
    />
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  color: PropTypes.string,
};

export default Spinner;

