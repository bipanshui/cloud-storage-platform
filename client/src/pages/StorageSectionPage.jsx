import PropTypes from "prop-types";

function StorageSectionPage({ title, description }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-8">
      <p className="text-sm font-medium text-neutral-500">Workspace section</p>
      <h1 className="mt-3 text-2xl font-semibold text-neutral-900">{title}</h1>
      <p className="mt-4 max-w-2xl text-sm text-neutral-500">{description}</p>
    </div>
  );
}

StorageSectionPage.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default StorageSectionPage;