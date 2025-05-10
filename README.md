
# 📖 Bookify: Digital Book Marketplace

Bookify is a modern, full-stack eBook marketplace that connects readers with authors and publishers. The platform provides a seamless experience for buying, selling, and discovering digital books across multiple genres and categories.

🔗 [Live App](https://ebook-marketplace-chi.vercel.app)  
🕐 _Note: The app may take up to 1 minute to start due to the Render free plan spinning down on inactivity._

![Bookify Screenshot](https://bookify-test.s3.eu-north-1.amazonaws.com/bookify.gif)

---

## 📚 Table of Contents

- [About Bookify](#about-bookify)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Deployment](#deployment)
- [Setup](#setup)
- [Testing](#testing)
- [Backend Documentation](#backend-documentation)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Listing Endpoints](#listing-endpoints)
  - [User-related Listing Endpoints](#user-related-listing-endpoints)
  - [Review Endpoints](#review-endpoints)
  - [Product Interaction Endpoints](#product-interaction-endpoints)
  - [Stripe Payment Endpoints](#stripe-payment-endpoints)
- [License](#license)
- [Author](#author)

---

## 🧾 About Bookify

Bookify serves as a digital marketplace where:

- **Readers** can discover, purchase, and download eBooks from various genres and authors.  
- **Authors & Publishers** can create listings, sell their works, and track analytics.

---

## ✨ Key Features

- 🔍 Intuitive eBook browsing with filters and categories  
- 📘 Detailed listings with previews, descriptions, and reviews  
- 👤 User profiles with favorites, history, and purchases  
- 📈 Seller dashboard with performance analytics  
- ⭐ Rating & review system  
- 💳 Secure Stripe-based payments  
- 📱 Fully responsive across devices  

---

## 🧰 Technology Stack

- **Frontend:** Next.js (React)  
- **Backend:** NestJS (REST API)  
- **File Upload:** AWS S3  
- **Database:** PostgreSQL with Prisma ORM  
- **Authentication:** JWT  
- **Payments:** Stripe Connect  
- **Testing:** Jest, React Testing Library  
- **Deployment:** Docker  

---

## 🚀 Deployment

- **Frontend:** Deployed on [Vercel](https://ebook-marketplace-chi.vercel.app)  
- **Backend:** Dockerized and hosted on [Render](https://ebook-marketplace.onrender.com)  

📌 _Note: Initial load time may be up to 1 minute due to Render's free tier behavior._

---

## ⚙️ Setup

### 🔐 Environment Variables

#### `./frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=<your-backend-api-url>
NEXT_PUBLIC_API_KEY=<shared-api-key>
```

#### `./backend/.env`
```env
DATABASE_URL=<your-postgresql-url>
JWT_SECRET=<your-jwt-secret>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
API_KEY=<shared-api-key>
FRONTEND_URL=<frontend-url>
```

### 🛠️ Local Development

```bash
# Start backend
cd backend
npm install
npm run start:dev

# Start frontend
cd ../frontend
npm install
npm run dev
```

---

## 🧪 Testing

### Frontend
```bash
npm run test
```

### Backend
```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Specific e2e test groups
npm run test:e2e:listing
npm run test:e2e:user
npm run test:e2e:auth
npm run test:e2e:stripe
```

---

## 📘 Backend Documentation

📄 Full API documentation available at:  
[https://ebook-marketplace.onrender.com/api#/](https://ebook-marketplace.onrender.com/api#/)

### 🔐 Authentication Endpoints

- `POST /api/v1/auth/register` – Register new user  
- `POST /api/v1/auth/login` – User login  

### 📚 Listing Endpoints

- `GET /api/v1/listing` – List all books (with filters)  
- `GET /api/v1/listing/:id` – Get single listing  
- `POST /api/v1/listing` – Create listing  
- `PUT /api/v1/listing/:id` – Update listing  
- `DELETE /api/v1/listing/:id` – Delete listing  
- `GET /api/v1/listing/categories` – Categories with books  
- `GET /api/v1/listing/featured` – Featured books  

### 👤 User-related Listing Endpoints

- `GET /api/v1/listing/favourites`  
- `POST /api/v1/listing/favourites/:id`  
- `DELETE /api/v1/listing/favourites/:id`  
- `GET /api/v1/listing/viewed`  
- `GET /api/v1/listing/user/:userId`  
- `GET /api/v1/listing/analytics`  

### 📝 Review Endpoints

- `GET /api/v1/listing/:id/reviews`  
- `POST /api/v1/listing/:id/reviews`  
- `PUT /api/v1/listing/reviews/:reviewId`  
- `DELETE /api/v1/listing/reviews/:reviewId`  

### 👁️ Product Interaction Endpoints

- `POST /api/v1/listing/:id/view` – Register view  
- `GET /api/v1/listing/:id/views` – Get view count  

### 💳 Stripe Payment Endpoints

- `POST /api/v1/stripe/order/checkout` – Checkout session  
- `POST /api/v1/stripe/connect` – Connect Stripe account  
- `GET /api/v1/stripe/balance` – View balance  
- `POST /stripe/webhook` – Handle Stripe webhook events  

---

## 📄 License

MIT

---

## 👨‍💻 Author

[Aleksander Baska](https://github.com/baskaaleksander)

---
