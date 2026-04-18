import { useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";
import { useFile } from "@/hooks/useFile";
import { HiChevronRight, HiHome } from "react-icons/hi2";

function Breadcrumb() {
  const navigate = useNavigate();
  const location = useLocation();
  const { breadcrumb, navigateToFolder } = useFile();

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const currentFolder = breadcrumb[breadcrumb.length - 1];

  const handleBreadcrumbClick = (folder) => {
    if (folder.id === null || folder.id === undefined) {
      navigate("/files");
    } else {
      navigate(`/files/${folder.id}`);
    }
  };

  if (isMobile) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/files")}
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <HiChevronRight className="h-4 w-4 rotate-180" />
          <HiHome className="h-4 w-4" />
        </button>
        {breadcrumb.length > 1 && (
          <>
            <HiChevronRight className="h-4 w-4 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-900 truncate max-w-[150px]">
              {currentFolder?.name || "My Drive"}
            </span>
          </>
        )}
      </div>
    );
  }

  if (breadcrumb.length > 4) {
    return (
      <nav className="flex items-center gap-1 text-sm">
        <button
          onClick={() => handleBreadcrumbClick(breadcrumb[0])}
          className="flex items-center gap-1 rounded px-2 py-1 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <HiHome className="h-4 w-4" />
          <span className="font-medium text-neutral-900">My Drive</span>
        </button>

        <HiChevronRight className="h-4 w-4 text-neutral-400" />

        <button className="flex items-center gap-1 rounded px-2 py-1 text-neutral-500">
          <span>...</span>
        </button>

        <HiChevronRight className="h-4 w-4 text-neutral-400" />

        <button
          onClick={() => handleBreadcrumbClick(breadcrumb[breadcrumb.length - 2])}
          className="max-w-[120px] truncate rounded px-2 py-1 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
        >
          {breadcrumb[breadcrumb.length - 2]?.name}
        </button>

        <HiChevronRight className="h-4 w-4 text-neutral-400" />

        <span className="font-medium text-neutral-900">
          {currentFolder?.name || "My Drive"}
        </span>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-1 text-sm">
      <button
        onClick={() => handleBreadcrumbClick(breadcrumb[0])}
        className="flex items-center gap-1 rounded px-2 py-1 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
      >
        <HiHome className="h-4 w-4" />
        <span className="font-medium text-neutral-900">My Drive</span>
      </button>

      {breadcrumb.slice(1).map((folder, index) => (
        <span key={folder.id || index} className="flex items-center gap-1">
          <HiChevronRight className="h-4 w-4 text-neutral-400" />
          <button
            onClick={() => handleBreadcrumbClick(folder)}
            className={clsx(
              "max-w-[120px] truncate rounded px-2 py-1",
              index === breadcrumb.length - 2
                ? "font-medium text-neutral-900"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            )}
          >
            {folder.name}
          </button>
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumb;