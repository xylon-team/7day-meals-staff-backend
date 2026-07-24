# Staff Endpoints

Staff endpoints are defined in `src/staff/staff.controller.ts`.

- **Base path:** `/staff`
- **Authentication:** All routes require `Authorization: Bearer <admin_jwt>` and are protected by `AdminJwtAuthGuard`.

---

## Legend

Parameters are labeled by location:

- **Path** — URL path segment (`:id`)
- **Query** — URL query string (`?key=value`)
- **Body** — JSON request body

---

## Data Models

### Staff

```json
{
  "staff_id": number,
  "fname": string,
  "lname": string,
  "phone_number": string,
  "status": string ("active" | "inactive")
}
```

### Staff Credential

```json
{
  "staff_credential_id": number,
  "staff_id": number,
  "email": string,
  "staff_password": string (hashed)
}
```

---

## Table of Contents

- [1. Create staff with credential](#1-create-staff-with-credential)
- [2. List all staff](#2-list-all-staff)
- [3. Get staff by ID](#3-get-staff-by-id)
- [4. Update staff](#4-update-staff)
- [5. Delete staff](#5-delete-staff)
- [6. Update staff credential](#6-update-staff-credential)

---

## Endpoints

### 1. Create staff with credential

**Endpoint:** `POST /staff`

**Description:** Creates a new staff member along with their login credentials in a single transaction. The password is automatically hashed before storage.

**Body Parameters (JSON):**

- `fname` (string, required): Staff member's first name.
- `lname` (string, required): Staff member's last name.
- `phone_number` (string, required): Staff member's phone number.
- `status` (string, required): Staff status. Must be either `"active"` or `"inactive"`.
- `email` (string, required): Staff member's email address (must be valid email format).
- `staff_password` (string, required): Staff member's password. Must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).

**Request Body:**

```json
{
  "fname": "John",
  "lname": "Doe",
  "phone_number": "1234567890",
  "status": "active",
  "email": "john.doe@example.com",
  "staff_password": "SecurePass123!"
}
```

**Response:**

```json
{
  "staff_id": 1,
  "fname": "John",
  "lname": "Doe",
  "phone_number": "1234567890",
  "status": "active"
}
```

---

### 2. List all staff

**Endpoint:** `GET /staff`

**Description:** Retrieves a list of all staff members in the system.

**Parameters:** None

**Response:**

```json
[
  {
    "staff_id": 1,
    "fname": "John",
    "lname": "Doe",
    "phone_number": "1234567890",
    "status": "active"
  },
  {
    "staff_id": 2,
    "fname": "Jane",
    "lname": "Smith",
    "phone_number": "0987654321",
    "status": "inactive"
  }
]
```

---

### 3. Get staff by ID

**Endpoint:** `GET /staff/:id`

**Description:** Retrieves a specific staff member by their ID.

**Path Parameters:**

- `id` (number): Staff member's unique identifier.

**Parameters:** None

**Response:**

```json
{
  "staff_id": 1,
  "fname": "John",
  "lname": "Doe",
  "phone_number": "1234567890",
  "status": "active"
}
```

---

### 4. Update staff

**Endpoint:** `PATCH /staff/:id`

**Description:** Updates a staff member's information. Can update staff fields, credential fields, or both in a single request. Password is automatically hashed if provided.

**Path Parameters:**

- `id` (number): Staff member's unique identifier.

**Body Parameters (JSON):**

All fields are optional. Only provided fields will be updated.

- `fname` (string, optional): Staff member's first name.
- `lname` (string, optional): Staff member's last name.
- `phone_number` (string, optional): Staff member's phone number.
- `status` (string, optional): Staff status. Must be either `"active"` or `"inactive"`.
- `email` (string, optional): Staff member's email address (must be valid email format).
- `staff_password` (string, optional): Staff member's new password. Must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).

**Request Body (update staff fields only):**

```json
{
  "fname": "John",
  "status": "inactive"
}
```

**Request Body (update credential only):**

```json
{
  "email": "new.email@example.com",
  "staff_password": "NewSecurePass123!"
}
```

**Request Body (update both):**

```json
{
  "fname": "John",
  "lname": "Updated",
  "email": "new.email@example.com"
}
```

**Response:**

```json
{
  "staff_id": 1,
  "fname": "John",
  "lname": "Updated",
  "phone_number": "1234567890",
  "status": "inactive"
}
```

---

### 5. Delete staff

**Endpoint:** `DELETE /staff/:id`

**Description:** Deletes a staff member from the system. This will also delete their associated credentials due to the database relationship.

**Path Parameters:**

- `id` (number): Staff member's unique identifier.

**Parameters:** None

**Response:**

```json
{
  "staff_id": 1,
  "fname": "John",
  "lname": "Doe",
  "phone_number": "1234567890",
  "status": "active"
}
```

---

### 6. Update staff credential

**Endpoint:** `PATCH /staff/:id/credential`

**Description:** Updates only the credential information (email and/or password) for a specific staff member. Password is automatically hashed if provided.

**Path Parameters:**

- `id` (number): Staff member's unique identifier.

**Body Parameters (JSON):**

All fields are optional. Only provided fields will be updated.

- `email` (string, optional): Staff member's email address (must be valid email format).
- `staff_password` (string, optional): Staff member's new password. Must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).

**Request Body:**

```json
{
  "email": "new.email@example.com",
  "staff_password": "NewSecurePass123!"
}
```

**Response:**

```json
{
  "staff_credential_id": 1,
  "staff_id": 1,
  "email": "new.email@example.com",
  "staff_password": "hashed_password"
}
```

---

## Common Errors

- `400 Bad Request`: Invalid request data (e.g., non-numeric ID, invalid email format, password doesn't meet complexity requirements, or no update data provided).
- `401 Unauthorized`: Missing or invalid authentication token.
- `404 Not Found`: Staff member with the specified ID does not exist.
- `409 Conflict`: Email address already exists in the system (when creating or updating credentials).
