import clsx from "clsx";
import PropTypes from "prop-types";
import { useState } from "react";
import { HiEye, HiEyeSlash } from "react-icons/hi2";

function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  disabled = false,
  required = false,
  name,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const resolvedType = type === "password" && showPassword ? "text" : type;

  return (
    <label className="block">
      {label ? (
        <span className="mb-2 block text-sm font-medium text-neutral-700">
          {label}
          {required ? <span className="ml-1 text-neutral-900">*</span> : null}
        </span>
      ) : null}

      <div className="relative">
        {Icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}

        <input
          name={name}
          type={resolvedType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={clsx(
            "w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition",
            Icon ? "pl-12" : "",
            type === "password" ? "pr-12" : "",
            error
              ? "border-neutral-900 focus:border-neutral-900"
              : "focus:border-neutral-900",
            disabled && "cursor-not-allowed bg-neutral-50 text-neutral-400"
          )}
        />

        {type === "password" ? (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400 hover:text-neutral-600"
          >
            {showPassword ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
          </button>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-sm text-neutral-600">{error}</p> : null}
    </label>
  );
}

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  icon: PropTypes.elementType,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  name: PropTypes.string,
};

export default Input;