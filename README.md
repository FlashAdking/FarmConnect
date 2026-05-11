# FarmConnect

A full-stack web application that connects farmers, wholesalers, and transporters for direct agricultural trade — eliminating intermediaries.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 23, Spring Boot 3.4.2, Spring Security (JWT + OAuth2) |
| Database | MongoDB Atlas |
| Templating | Thymeleaf |
| Image Storage | Cloudinary |
| Frontend | HTML, Vanilla CSS, Vanilla JavaScript |

---

## Prerequisites

- JDK 23
- Maven 3.8+ (or use the included `./mvnw` wrapper)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster or local mongodb server 
- A [Cloudinary](https://cloudinary.com) account or any other image storage service 

---

## Setup

**1. Clone the repository**

```bash
git clone https://github.com/FlashAdking/FarmConnect.git
cd FarmConnect/FarmConnect
```

**2. Configure environment variables**

```bash
cp .env.sample .env
```

Fill in `.env` with your credentials. All required keys are documented in `.env.sample`.

**3. Run the application**

```bash
./mvnw spring-boot:run        # Linux / macOS
mvnw.cmd spring-boot:run      # Windows
```

The application starts on **http://localhost:8081**

---

## User Roles & Workflow

**Farmer**
1. Register or log in at `/farmerlogin`
2. Profile page (`/profile`) — edit info, upload photo, manage crops (add / edit / delete)
3. View confirmed deals and total sales on the same page

**Wholesaler**
1. Register or log in at `/wholesalerlogin`
2. Browse crops at `/crops` → add to cart → checkout at `/checkout`
3. View purchase history at `/profile`

**Transporter**
- Registration available at `/Signuptransporter`
- Deal bidding system is under development

---

## Project Structure

```
FarmConnect/
├── src/main/
│   ├── java/com/FarmConnect/WebApplication/
│   │   ├── config/          Security, JWT, Cloudinary config
│   │   ├── controller/      REST API + page route controllers
│   │   ├── model/           MongoDB document models
│   │   ├── repository/      Spring Data repositories
│   │   └── service/         Business logic
│   └── resources/
│       ├── application.properties
│       ├── templates/       Thymeleaf HTML pages
│       └── static/
│           ├── css/         global.css + page-specific stylesheets
│           └── js/          global.js + page-specific scripts
└── pom.xml
```

---

## API Overview

All `/api/*` endpoints return JSON. Protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

| Resource | Endpoints |
|---|---|
| Farmer | `POST /api/farmer/login` `POST /api/farmer/register` `GET/PUT /api/farmer/profile` `GET /api/farmer/crops` `GET /api/farmer/deals` |
| Wholesaler | `POST /api/wholesaler/login` `POST /api/wholesaler/register` `GET/PUT /api/wholesaler/profile` |
| Crops | `GET /api/crops` `GET /api/crops/{id}` `POST /api/crops/add` `PUT /api/crops/{id}/update` `DELETE /api/crops/{id}/delete` |
| Deals | `POST /api/deals/confirm` `GET /api/deals/farmer` `GET /api/deals/wholesaler` |

---

## Troubleshooting

**MongoDB connection fails** — Check `MONGODB_URI` in `.env` and ensure your IP is whitelisted in Atlas (Network Access).

**Port 8081 in use** — Kill the process or change `server.port` in `application.properties`.

**Images not uploading** — Verify `CLOUDINARY_URL` format: `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`.

**`Unknown Template Mode 'HTML5'` warning** — Non-breaking. Fix by changing `spring.thymeleaf.mode=HTML5` to `HTML` in `application.properties`.
