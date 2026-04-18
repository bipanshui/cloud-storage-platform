const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

/**
 * Returns field errors for the login form.
 * @param {{ email: string, password: string }} values
 * @returns {Record<string, string>}
 */
export function validateLoginForm(values) {
  const errors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}

/**
 * Returns field errors for the registration form.
 * @param {{ firstName: string, lastName: string, email: string, password: string, confirmPassword: string }} values
 * @returns {Record<string, string>}
 */
export function validateRegisterForm(values) {
  const errors = {};

  if (!values.firstName.trim()) {
    errors.firstName = "First name is required.";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Last name is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (!strongPasswordPattern.test(values.password)) {
    errors.password =
      "Password must be 8+ characters and include uppercase, lowercase, number, and special character.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

/**
 * Scores password strength for display.
 * @param {string} password
 * @returns {{ label: string, colorClass: string, progressClass: string, score: number }}
 */
export function getPasswordStrength(password) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z\d]/.test(password),
  ];

  const score = checks.filter(Boolean).length;

  if (score <= 2) {
    return {
      label: "Weak",
      colorClass: "text-danger-500",
      progressClass: "bg-danger-500",
      score,
    };
  }

  if (score <= 4) {
    return {
      label: "Medium",
      colorClass: "text-amber-500",
      progressClass: "bg-amber-500",
      score,
    };
  }

  return {
    label: "Strong",
    colorClass: "text-success-500",
    progressClass: "bg-success-500",
    score,
  };
}

