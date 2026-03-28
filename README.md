# LostNFound

A campus lost-and-found platform for **Thapar Institute of Engineering & Technology**. Students and staff can post lost or found items, search and filter listings, and contact each other directly through the platform.

---

## Features

- **Post listings** — Report a lost or found item with photos, location, description, and category
- **Search & filter** — Filter by type (lost/found), category (gadgets, clothing, college supplies), and sort by date
- **Resolve items** — Mark a listing as resolved once the item is returned
- **Contact posters** — Pre-filled email draft opens directly from a listing
- **Google OAuth** — Sign in with a Google account via Firebase
- **Notifications** — In-app notification feed grouped by date with type icons
- **Dark mode** — Full dark theme toggle, persisted across sessions
- **Responsive** — Works on mobile and desktop

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 18, Vite, Tailwind CSS |
| State | Redux Toolkit + Redux Persist |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (HTTP-only cookie) + Firebase Google OAuth |
| Storage | Firebase Storage (images) |
| Routing | React Router v6 |

---

## Project Structure

```
LostNFound/
├── api/
│   ├── controllers/       auth, listing, user, notification
│   ├── models/            User, Listing, Notification
│   ├── routes/            /api/auth  /api/listing  /api/user  /api/notification
│   └── utils/             verifyUser middleware, error helper, rate limiter
└── client/
    └── src/
        ├── components/
        │   ├── layout/    Header, Footer, SideDrawer
        │   ├── listing/   ListingItem, ListingForm, Contact, SafetyNotice
        │   └── ui/        Toast, ConfirmModal, SkeletonCard, StatusBadge, HowItWorks
        ├── pages/         Home, Search, Listing, Profile, CreateListing, UpdateListing,
        │                  SignIn, SignUp, About, Notifications, NotFound
        ├── redux/         store, userSlice
        └── utils/         toast, timeAgo, analytics
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Firebase project (Storage + Google Auth enabled)

### Environment Variables

**`LostNFound/.env`** (backend):
```
MONGO=<MongoDB Atlas connection string>
JWT_SECRET=<your secret>
```

**`LostNFound/client/.env`** (frontend):
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Development

Run both servers from the `LostNFound/` directory:

```bash
# Terminal 1 — backend (Express on :3000)
npm run dev

# Terminal 2 — frontend (Vite on :5173, proxies /api → :3000)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Production Build

```bash
# From LostNFound/
npm run build   # installs deps + builds Vite bundle to client/dist
npm start       # serves built SPA + API on :3000
```

---

## API Overview

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/signup` | — | Register |
| POST | `/api/auth/signin` | — | Sign in, sets JWT cookie |
| POST | `/api/auth/signout` | — | Clear cookie |
| GET | `/api/listing/get` | — | List listings (filters, pagination) |
| GET | `/api/listing/get/:id` | — | Single listing |
| POST | `/api/listing/create` | ✓ | Create listing |
| POST | `/api/listing/update/:id` | ✓ | Update listing |
| DELETE | `/api/listing/delete/:id` | ✓ | Delete listing |
| PATCH | `/api/listing/resolve/:id` | ✓ | Toggle resolved state |
| GET | `/api/user/listings/:id` | ✓ | Listings by user |
| POST | `/api/user/update/:id` | ✓ | Update profile |
| DELETE | `/api/user/delete/:id` | ✓ | Delete account |

### Listing Query Params

`GET /api/listing/get` supports:

| Param | Type | Description |
|-------|------|-------------|
| `searchTerm` | string | Name/description search |
| `type` | `lost` \| `found` | Filter by type |
| `clothing` `college` `gadgets` | boolean | Category filters |
| `sort` | `createdAt` | Sort field |
| `order` | `asc` \| `desc` | Sort order |
| `limit` | number | Results per page (default 9) |
| `startIndex` | number | Pagination offset |

Response shape: `{ items: [], total: N, hasMore: boolean }`

---

## Listing Categories

| Category | Examples |
|----------|---------|
| Gadgets | Phones, laptops, earphones, chargers |
| Clothing | Jackets, hoodies, bags, accessories |
| College Supplies | ID cards, notebooks, stationery |
| Other | Keys, wallets, water bottles |

---

## Screenshots

> Add screenshots here after setting up Firebase and seeding data.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with a prefix: `feat:` `fix:` `style:` `refactor:`
4. Open a pull request

---

## License

MIT
