import clsx from "clsx";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import logo from "@/assets/logo.svg";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME, NAV_ITEMS } from "@/utils/constants";
import { formatBytes, getStorageUsagePercentage } from "@/utils/helpers";

function Sidebar({ isCollapsed, isMobileOpen, onClose }) {
  const { user } = useAuth();
  const usage = getStorageUsagePercentage(user);

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-30 bg-neutral-900/50 lg:hidden",
          isMobileOpen ? "block" : "hidden"
        )}
        onClick={onClose}
        role="presentation"
      />

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-neutral-200 bg-neutral-50 px-4 py-5 transition-transform duration-200 lg:static lg:translate-x-0",
          isCollapsed && "lg:w-20",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className={clsx("flex items-center gap-3 px-2", isCollapsed && "lg:justify-center")}>
          <img src={logo} alt={`${APP_NAME} logo`} className="h-10 w-10" />
          {!isCollapsed && (
            <div>
              <p className="text-base font-medium text-neutral-900">{APP_NAME}</p>
            </div>
          )}
        </div>

        <nav className="mt-8 flex-1 space-y-1">
          {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition",
                  isCollapsed && "lg:justify-center lg:px-3",
                  isActive
                    ? "bg-neutral-200 text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          {!isCollapsed ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-900">Storage</span>
                <span className="text-neutral-500">{usage}%</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-neutral-200">
                <div
                  className={clsx(
                    "h-1.5 rounded-full bg-neutral-900",
                    usage < 25 && "w-1/4",
                    usage >= 25 && usage < 50 && "w-1/2",
                    usage >= 50 && usage < 75 && "w-3/4",
                    usage >= 75 && "w-full"
                  )}
                />
              </div>
              <p className="mt-3 text-xs text-neutral-500">
                {formatBytes(user?.storageUsed || 0)} of {formatBytes(user?.storageLimit || 0)}
              </p>
            </>
          ) : (
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium text-neutral-700">
              {usage}%
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  isMobileOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;