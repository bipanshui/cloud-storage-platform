import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

function LoginPage() {
  return (
    <AuthLayout
      heading="Sign in to your workspace"
      subheading="Access your files, shared folders, and recent activity with secure session management."
    >
      <LoginForm />
    </AuthLayout>
  );
}

export default LoginPage;

