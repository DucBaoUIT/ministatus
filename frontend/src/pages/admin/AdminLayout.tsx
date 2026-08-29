import { NavLink, Outlet } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/services", label: "Services", end: false },
  { to: "/admin/incidents", label: "Incidents", end: false },
  { to: "/admin/runtime", label: "Runtime", end: false },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-base-950 md:flex">
      <aside className="border-b border-base-700 bg-base-900 md:w-56 md:shrink-0 md:border-b-0 md:border-r">
        <div className="px-5 py-6">
          <p className="font-mono text-sm text-base-200">MiniStatus</p>
          <p className="text-xs text-base-400">Admin</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-col md:overflow-visible">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-md px-3 py-2 text-sm ${
                  isActive ? "bg-base-800 text-base-200" : "text-base-400 hover:text-base-200"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 px-6 py-8 md:px-10">
        <Outlet />
      </div>
    </div>
  );
}
