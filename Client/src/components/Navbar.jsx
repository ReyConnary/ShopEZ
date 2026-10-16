import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        ShopEZ
      </Link>
      <div className="nav-links">
        <Link to="/products">Products</Link>
        {user && <Link to="/orders">My Orders</Link>}
        {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        <Link to="/cart">Cart ({itemCount})</Link>
        {user ? (
          <>
            <Link to="/profile">{user.username}</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
