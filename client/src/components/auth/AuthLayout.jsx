import PropTypes from "prop-types";

function AuthLayout({ children, heading, subheading }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex min-h-screen">
        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-neutral-900">{heading}</h2>
              {subheading && (
                <p className="mt-2 text-sm text-neutral-500">{subheading}</p>
              )}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  heading: PropTypes.string.isRequired,
  subheading: PropTypes.string.isRequired,
};

export default AuthLayout;