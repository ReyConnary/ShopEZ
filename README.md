# ShopEZ — Full-stack e-commerce app (SmartBridge MongoDB project)

Covers Week 1–5 milestones: project setup, MongoDB schemas (User, Product, Cart,
Orders, Admin), Express REST API, JWT auth, and a React/Vite frontend wired to
every endpoint (landing, products, auth, profile, cart, checkout, order history,
admin dashboard).

## Structure

```
ShopEZ/
├── Server/
│   ├── server.js            entry point (connects Mongo, starts Express)
│   ├── models/               User, Product, Cart, Orders, Admin
│   ├── controllers/          request handlers (business logic)
│   ├── routes/                thin route → controller wiring
│   └── middleware/           authMiddleware, adminMiddleware
└── Client/
    ├── src/pages/             Landing, Products, ProductDetail, Login,
    │                          Register, Profile, Cart, Checkout, Orders
    ├── src/pages/admin/       AdminLayout (+ nested tabs: AdminProducts,
    │                          AdminOrders, AdminUsers) — separate routes
    │                          at /admin/products, /admin/orders, /admin/users
    ├── src/context/           AuthContext, CartContext
    └── src/api.js             fetch wrapper for the backend
```

## 1. Backend setup

```
cd Server
npm install
cp .env.example .env
```

(The entry point is `server.js`, matching the milestone's `npm init` + `server.js` step; `npm start`/`npm run dev` both point at it.)

Edit `.env`:
- `MONGODB_URI` — your MongoDB Atlas (or local) connection string
- `JWT_SECRET` — any long random string
- `PORT` — optional, defaults to 5000

Run it:

```
npm run dev      # with nodemon, auto-restart
# or
npm start
```

You should see:

```
MongoDB Atlas connected successfully!
ShopEZ server running on port 5000
```

Visit `http://localhost:5000` → should show `ShopEZ API is running!`.

## 2. Frontend setup

In a second terminal:

```
cd Client
npm install
npm run dev
```

Open the printed localhost URL (usually `http://localhost:5173`). The Vite dev
server proxies `/api/*` requests to `http://localhost:5000` (see
`vite.config.js`), so you don't need to configure CORS origins for local dev.

## 3. Creating your first admin account

There's no public "become admin" button (by design — the registration route
never accepts a role from the client). To get an admin user:

1. Register a normal account through the UI.
2. In MongoDB Atlas (or Compass), open the `users` collection and change that
   user's `role` field from `"user"` to `"admin"`.
3. Log out and back in on the frontend so the new JWT carries `role: "admin"`.
4. The **Admin** link will now appear in the navbar, unlocking `/admin`
   (create/deactivate products, manage order statuses, change user roles).

After that, you can promote further users from inside the Admin → Users tab.

## 4. API reference

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/products` | public | list active products (`?search=`, `?category=`) |
| GET | `/api/products/:id` | public | get one active product |
| POST | `/api/products` | admin | create product |
| PUT | `/api/products/:id` | admin | update product |
| DELETE | `/api/products/:id` | admin | soft-delete (deactivate) product |
| POST | `/api/users/register` | public | register |
| POST | `/api/users/login` | public | login → JWT |
| POST | `/api/users/logout` | user | invalidate client-side session (JWT itself is stateless) |
| GET | `/api/users/me` | user | current profile |
| PUT | `/api/users/me` | user | update username/address |
| GET | `/api/cart` | user | get cart (populated with product/variant info) |
| POST | `/api/cart/add` | user | add item (merges quantity if variant already present) |
| PUT | `/api/cart/update` | user | set item quantity |
| DELETE | `/api/cart/remove` | user | remove one item |
| DELETE | `/api/cart/clear` | user | empty cart |
| POST | `/api/orders/checkout` | user | convert cart → order, deduct stock, clear cart |
| GET | `/api/orders/mine` | user | your order history |
| GET | `/api/orders` | admin | all orders |
| PUT | `/api/orders/:id/status` | admin | update order status |
| GET | `/api/admin/config` | admin | banner/categories |
| PUT | `/api/admin/config` | admin | update banner/categories |
| GET | `/api/admin/users` | admin | list users |
| PUT | `/api/admin/users/:id/role` | admin | promote/demote a user |
| GET | `/api/auth-test` | user | sanity-check a token |

All authenticated routes expect `Authorization: Bearer <token>`.

## 5. Seeding a sample product (optional, via curl/Postman)

Once you have an admin token (login response's `token` field):

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "category": "Electronics",
    "variants": [
      { "sku": "MOUSE-BLACK", "price": 150000, "stock": 10 },
      { "sku": "MOUSE-WHITE", "price": 160000, "stock": 5 }
    ]
  }'
```

Or just use the Admin dashboard's "Create product" form once logged in as admin.

## 6. What maps to each week's milestone

- **Week 1** — `Client/` + `Server/` split, Vite React scaffold, `npm init`, and the exact folder layout from the milestone: `server.js` as the entry point, plus `models/`, `routes/`, and `controllers/` (handler logic lives in `controllers/`, routes just wire paths to controller functions).
- **Week 2** — Mongoose connection in `server.js`; `User`, `Product`, `Orders`, `Cart`, `Admin` schemas in `Server/models/`, matching the fields and references described (unique email, userId refs, etc.).
- **Week 3** — Express server with CORS/JSON middleware, route files per feature (`productRoutes`, `userRoutes`, `cartRoutes`, `orderRoutes`, `adminRoutes`) delegating to matching `controllers/`, Mongoose models with CRUD, registration/login/logout routes, JWT auth middleware protecting routes, admin middleware for admin-only routes, and a centralized error handler.
- **Week 4** — React app with routing (`react-router-dom`), components (`Navbar`, `ProtectedRoute`), styled layout, and API integration/data binding via `src/api.js` plus `AuthContext`/`CartContext`.
- **Week 5** — Auth (login/register/logout, logout now also calls `POST /api/users/logout`) end-to-end, All Products with filtering, add-to-cart/buy flow, order placement, and every named UI page as its **own route**: Landing (`/`), Products (`/products`), Authentication (`/login`, `/register`), User Profile (`/profile`), Cart (`/cart`), Admin Dashboard (`/admin`, tabs linking to nested routes), All Orders (`/admin/orders` for admins, `/orders` for a user's own history), All Products admin view (`/admin/products`).

## 7. Known simplifications worth knowing about

- Checkout uses a MongoDB transaction (`mongoose.startSession`) to deduct stock
  and create the order atomically — this requires a replica set, which Atlas
  provides by default. A local standalone `mongod` without a replica set will
  reject transactions; use Atlas or `mongod --replSet` locally if you hit that.
- There's no payment gateway integration (not in the milestone list) — checkout
  just records the order as `pending`.
- `cart/add`'s stock check and `checkout`'s stock deduction are both
  server-side, but under concurrent requests there's a small race window on
  the cart-add check (the transaction in checkout is the real guard).
