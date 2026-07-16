# Settings Endpoints

Settings endpoints are defined in `src/settings/setting.controller.ts`.

- **Base path:** `/settings`
- **Authentication:** All routes require `Authorization: Bearer <admin_jwt>` and are protected by `AdminJwtAuthGuard`.

---

## Legend

Parameters are labeled by location:

- **Path** — URL path segment (`:id`)
- **Query** — URL query string (`?key=value`)
- **Body** — JSON request body

---

## Data Models

### Setting

```json
{
  "id": number,
  "delivery_radius": number,
  "latitude": number,
  "longitude": number,
  "delivery_fee": number,
  "created_at": string (ISO 8601 datetime),
  "updated_at": string (ISO 8601 datetime)
}
```

---

## Table of Contents

- [1. Create settings](#1-create-settings)
- [2. Read settings](#2-read-settings)
- [3. Update settings](#3-update-settings)

---

## Endpoints

### 1. Create settings

**Endpoint:** `POST /settings`

**Description:** Creates new application settings for delivery configuration.

**Body Parameters (JSON):**

- `delivery_radius` (number, required): Maximum delivery radius in kilometers.
- `latitude` (number, required): Base location latitude coordinate.
- `longitude` (number, required): Base location longitude coordinate.
- `delivery_fee` (number, required): Delivery fee amount (must be positive).

**Request Body:**

```json
{
  "delivery_radius": 10,
  "latitude": 40.7128,
  "longitude": -74.006,
  "delivery_fee": 5.99
}
```

**Response:**

```json
{
  "id": 1,
  "delivery_radius": 10,
  "latitude": 40.7128,
  "longitude": -74.006,
  "delivery_fee": 5.99,
  "created_at": "2026-07-12T10:00:00.000Z",
  "updated_at": "2026-07-12T10:00:00.000Z"
}
```

---

### 2. Read settings

**Endpoint:** `GET /settings`

**Description:** Retrieves the current application settings for delivery configuration.

**Parameters:** None

**Response:**

```json
{
  "id": 1,
  "delivery_radius": 10,
  "latitude": 40.7128,
  "longitude": -74.006,
  "delivery_fee": 5.99,
  "created_at": "2026-07-12T10:00:00.000Z",
  "updated_at": "2026-07-12T10:00:00.000Z"
}
```

---

### 3. Update settings

**Endpoint:** `PATCH /settings`

**Description:** Updates existing application settings. All fields are optional - only provided fields will be updated.

**Body Parameters (JSON):**

- `delivery_radius` (number, optional): Maximum delivery radius in kilometers.
- `latitude` (number, optional): Base location latitude coordinate.
- `longitude` (number, optional): Base location longitude coordinate.
- `delivery_fee` (number, optional): Delivery fee amount (must be positive if provided).

**Request Body:**

```json
{
  "delivery_radius": 15,
  "delivery_fee": 7.99
}
```

**Response:**

```json
{
  "id": 1,
  "delivery_radius": 15,
  "latitude": 40.7128,
  "longitude": -74.006,
  "delivery_fee": 7.99,
  "created_at": "2026-07-12T10:00:00.000Z",
  "updated_at": "2026-07-12T11:30:00.000Z"
}
```

---

## Common Errors

- `400 Bad Request`: Validation error when required fields are missing or invalid (e.g., negative delivery_fee, non-integer delivery_radius).
- `401 Unauthorized`: Invalid or missing JWT token in Authorization header.
- `404 Not Found`: Settings record does not exist (for read/update operations).
- `409 Conflict`: Attempting to create settings when they already exist.
