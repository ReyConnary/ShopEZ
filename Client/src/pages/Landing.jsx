import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="landing">
      <h1>Welcome to ShopEZ</h1>
      <p>Simple, flexible e-commerce — browse products, add variants to your cart, and check out.</p>
      <Link to="/products" className="btn">
        Shop now
      </Link>
    </div>
  );
}
