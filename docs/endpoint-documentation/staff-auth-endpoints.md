# Staff Authentication Endpoints

Staff authentication endpoints are defined in `src/staff-auth/staff-auth.controller.ts`.

- **Base path:** `/staff-auth`
- **Authentication:** Login is a public route and does not require an `Authorization` header. A successful login returns a JWT access token for authenticated staff requests.

---

## Legend

Parameters are labeled by location:

- **Path** — URL path segment (`:id`)
- **Query** — URL query string (`?key=value`)
- **Body** — JSON request body

---

## Data Models

### Staff Login Request

```json
{
  "email": string,
  "staff_password": string
}
```

### Staff Login Response

```json
{
  "access_token": string (JWT)
}
```

The access token is a JWT containing the staff ID and email. The token expires after 1 day.

---

## Table of Contents

- [1. Staff login](#1-staff-login)

---

## Endpoints

### 1. Staff login

**Endpoint:** `POST /staff-auth/login`

**Description:** Authenticates an active staff member using their email address and password, then returns a JWT access token.

**Authentication:** None. This is a public authentication endpoint.

**Body Parameters (JSON):**

- `email` (string, required): Staff member's email address. Must be a valid email format.
- `staff_password` (string, required): Staff member's password.

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "staff_password": "SecurePass123!"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Use the returned token in the `Authorization` header when calling protected staff endpoints:

```text
Authorization: Bearer <access_token>
```

---

## Common Errors

- `400 Bad Request`: Required fields are missing, the email format is invalid, or a field has an invalid type.
- `401 Unauthorized`: The email or password is invalid, or the staff account is inactive.
