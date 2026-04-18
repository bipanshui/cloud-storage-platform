import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";

function RegisterPage() {
  return (
    <AuthLayout
      heading="Create your CloudVault account"
      subheading="Start with a secure account and keep your files available wherever you work."
    >
      <RegisterForm />
    </AuthLayout>
  );
}

export default RegisterPage;

