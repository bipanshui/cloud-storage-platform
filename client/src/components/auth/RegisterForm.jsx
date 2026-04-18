import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiEnvelope, HiLockClosed, HiUser } from "react-icons/hi2";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/utils/helpers";
import { getPasswordStrength, validateRegisterForm } from "@/utils/validators";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showError, showSuccess } = useToast();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = getPasswordStrength(values.password);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateRegisterForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await register(
        values.firstName,
        values.lastName,
        values.email,
        values.password
      );
      showSuccess("Account created successfully.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          name="firstName"
          label="First name"
          placeholder="Jane"
          value={values.firstName}
          onChange={handleChange}
          error={errors.firstName}
          icon={HiUser}
          disabled={isSubmitting}
          required
        />
        <Input
          name="lastName"
          label="Last name"
          placeholder="Doe"
          value={values.lastName}
          onChange={handleChange}
          error={errors.lastName}
          icon={HiUser}
          disabled={isSubmitting}
          required
        />
      </div>

      <Input
        name="email"
        label="Email"
        type="email"
        placeholder="name@company.com"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        icon={HiEnvelope}
        disabled={isSubmitting}
        required
      />

      <div className="space-y-3">
        <Input
          name="password"
          label="Password"
          type="password"
          placeholder="Create a strong password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          icon={HiLockClosed}
          disabled={isSubmitting}
          required
        />

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Password strength</span>
            <span className={strength.colorClass}>{strength.label}</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-neutral-200">
            <div
              className={`h-2 rounded-full ${strength.progressClass} ${
                strength.score === 1
                  ? "w-1/5"
                  : strength.score === 2
                  ? "w-2/5"
                  : strength.score === 3
                  ? "w-3/5"
                  : strength.score === 4
                  ? "w-4/5"
                  : strength.score === 5
                  ? "w-full"
                  : "w-0"
              }`}
            />
          </div>
        </div>
      </div>

      <Input
        name="confirmPassword"
        label="Confirm password"
        type="password"
        placeholder="Repeat your password"
        value={values.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        icon={HiLockClosed}
        disabled={isSubmitting}
        required
      />

      <Button type="submit" fullWidth isLoading={isSubmitting}>
        Create account
      </Button>

      <p className="text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <Link className="font-semibold text-neutral-900 hover:underline" to="/login">
          Log in
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;