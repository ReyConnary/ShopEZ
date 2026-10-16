import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div className="tabs">
        <NavLink to="/admin/products" className={({ isActive }) => (isActive ? "active" : "")}>
          All Products
        </NavLink>
        <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? "active" : "")}>
          All Orders
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "active" : "")}>
          Users
        </NavLink>
        <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? "active" : "")}>
          Settings
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
