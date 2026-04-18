import clsx from "clsx";
import PropTypes from "prop-types";
import { useState } from "react";
import { HiBars3, HiBell, HiChevronDown, HiMagnifyingGlass } from "react-icons/hi2";
import Button from "@/components/common/Button";
import { useAuth } from "@/hooks/useAuth";
import { formatBytes, getUserInitials } from "@/utils/helpers";

function Navbar({ onMenuClick, onToggleSidebar, isSidebarCollapsed }) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
          >
            <HiBars3 className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 lg:inline-flex"
          >
            {isSidebarCollapsed ? "Expand" : "Collapse"}
          </button>

          <div className="relative hidden min-w-[240px] md:block">
            <HiMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search files, folders"
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-neutral-200 p-2.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <HiBell className="h-5 w-5" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((current) => !current)}
              className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-2 py-2 hover:bg-neutral-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm font-medium text-white">
                {getUserInitials(user)}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-neutral-900">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
              <HiChevronDown className="hidden h-4 w-4 text-neutral-400 sm:block" />
            </button>

            <div
              className={clsx(
                "absolute right-0 mt-2 w-64 rounded-lg border border-neutral-200 bg-white p-2 shadow-flat transition",
                isDropdownOpen ? "visible" : "invisible"
              )}
            >
              <div className="rounded-lg bg-neutral-50 px-4 py-3">
                <p className="text-sm font-medium text-neutral-900">Storage</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {formatBytes(user?.storageUsed || 0)} of {formatBytes(user?.storageLimit || 0)}
                </p>
              </div>

              <div className="mt-2 space-y-0.5">
                <button
                  type="button"
                  className="w-full rounded-lg px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  Profile
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  Settings
                </button>
              </div>

              <Button
                variant="ghost"
                fullWidth
                onClick={() => {
                  setIsDropdownOpen(false);
                  void logout();
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

Navbar.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
  isSidebarCollapsed: PropTypes.bool.isRequired,
};

export default Navbar;