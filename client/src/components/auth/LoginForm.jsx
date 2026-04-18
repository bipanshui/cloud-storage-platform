import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiEnvelope, HiLockClosed } from "react-icons/hi2";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/utils/helpers";
import { validateLoginForm } from "@/utils/validators";

const initialValues = {
  email: "",
  password: "",
};

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateLoginForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await login(values.email, values.password);
      showSuccess("Welcome back.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
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

      <Input
        name="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        icon={HiLockClosed}
        disabled={isSubmitting}
        required
      />

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex items-center gap-3 text-neutral-600">
          <input
            type="checkbox"
            className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
            disabled={isSubmitting}
          />
          <span>Remember me</span>
        </label>

        <button type="button" className="font-medium text-neutral-900 hover:underline">
          Forgot password?
        </button>
      </div>

      <Button type="submit" fullWidth isLoading={isSubmitting}>
        Sign in
      </Button>

      <p className="text-center text-sm text-neutral-600">
        Don&apos;t have an account?{" "}
        <Link className="font-semibold text-neutral-900 hover:underline" to="/register">
          Sign up
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;