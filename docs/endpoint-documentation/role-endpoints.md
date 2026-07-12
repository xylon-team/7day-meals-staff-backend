# Role Management Endpoints

Role management endpoints are defined in `src/role/role.controller.ts`.

- **Base path:** `/role`
- **Authentication:** All routes require `Authorization: Bearer <admin_jwt>` and are protected by `AdminJwtAuthGuard`.

---

## Legend

Parameters are labeled by location:

- **Path** — URL path segment (`:id`)
- **Query** — URL query string (`?key=value`)
- **Body** — JSON request body

---

## Data Models

### Role

```json
{
  "role_id": 1,
  "role": "manager",
  "description": "Manages staff and operations"
}
```

### Permission

```json
{
  "permission_id": 1,
  "permission_type": "manage_staff"
}
```

### Role with permissions

Pass `?includePermissions=true` to `GET /role`, `GET /role/:id`, or `GET /role/search` to include the related permission set.

```json
{
  "role_id": 1,
  "role": "manager",
  "description": "Manages staff and operations",
  "role_permissions": [
    {
      "role_id": 1,
      "permission_id": 2,
      "permission": {
        "permission_id": 2,
        "permission_type": "manage_staff"
      }
    }
  ]
}
```

---

## Table of Contents

- [1. List all permissions](#1-list-all-permissions)
- [2. Create a role](#2-create-a-role)
- [3. List all roles](#3-list-all-roles)
- [4. Search roles](#4-search-roles)
- [5. Get role by ID](#5-get-role-by-id)
- [6. Update role](#6-update-role)
- [7. Delete role](#7-delete-role)
- [8. Get role permissions](#8-get-role-permissions)
- [9. Assign permissions to role](#9-assign-permissions-to-role)
- [10. Remove permissions from role](#10-remove-permissions-from-role)

---

## Endpoints

### 1. List all permissions

**Endpoint:** `GET /role/permissions`

**Description:** Returns all available permissions.

**Parameters:** None

**Response:**

```json
[
  { "permission_id": 1, "permission_type": "manage_staff" },
  { "permission_id": 2, "permission_type": "view_orders" }
]
```

---

### 2. Create a role

**Endpoint:** `POST /role`

**Description:** Creates a new role.

**Body Parameters (JSON):**

- `role` (string, required): role name.
- `description` (string, required): role description.

**Request Body:**

```json
{
  "role": "manager",
  "description": "Manages staff and operations"
}
```

**Response:**

```json
{
  "role_id": 1,
  "role": "manager",
  "description": "Manages staff and operations"
}
```

---

### 3. List all roles

**Endpoint:** `GET /role`

**Description:** Returns all roles.

**Query Parameters:**

- `includePermissions` (string, optional): pass `true` to include each role's permissions.

**Response:**

```json
[
  {
    "role_id": 1,
    "role": "manager",
    "description": "Manages staff and operations"
  }
]
```

---

### 4. Search roles

**Endpoint:** `GET /role/search`

**Description:** Searches roles by role name and/or description using substring (`contains`) matching.

**Query Parameters:**

- `role` (string, optional): substring to match against the role name.
- `description` (string, optional): substring to match against the role description.
- `includePermissions` (string, optional): pass `true` to include each role's permissions.

**Response:** Array of role objects (same as `GET /role`).

---

### 5. Get role by ID

**Endpoint:** `GET /role/:id`

**Description:** Returns a single role by numeric ID.

**Path Parameters:**

- `id` (number): role ID.

**Query Parameters:**

- `includePermissions` (string, optional): pass `true` to include the role's permissions.

**Response:**

```json
{
  "role_id": 1,
  "role": "manager",
  "description": "Manages staff and operations"
}
```

---

### 6. Update role

**Endpoint:** `PATCH /role/:id`

**Description:** Updates a role's name and/or description.

**Path Parameters:**

- `id` (number): role ID.

**Body Parameters (JSON):**

- `role` (string, optional): new role name.
- `description` (string, optional): new role description.

**Request Body:**

```json
{
  "role": "supervisor",
  "description": "Oversees daily operations"
}
```

**Response:** Updated role object.

---

### 7. Delete role

**Endpoint:** `DELETE /role/:id`

**Description:** Deletes a role by ID. Related `staff_role` and `role_permission` records are removed via cascade.

**Path Parameters:**

- `id` (number): role ID.

**Response:** Deleted role object.

---

### 8. Get role permissions

**Endpoint:** `GET /role/:id/permissions`

**Description:** Returns all permissions currently assigned to a role.

**Path Parameters:**

- `id` (number): role ID.

**Response:**

```json
[
  { "permission_id": 2, "permission_type": "manage_staff" },
  { "permission_id": 3, "permission_type": "view_orders" }
]
```

---

### 9. Assign permissions to role

**Endpoint:** `POST /role/:id/permissions`

**Description:** Assigns one or more permissions to a role. Duplicate entries are skipped.

**Path Parameters:**

- `id` (number): role ID.

**Body Parameters (JSON):**

- `permissionIds` (number[], required): array of permission IDs to assign.

**Request Body:**

```json
{
  "permissionIds": [2, 3]
}
```

**Response:**

```json
{
  "count": 2
}
```

---

### 10. Remove permissions from role

**Endpoint:** `DELETE /role/:id/permissions`

**Description:** Removes one or more permissions from a role.

**Path Parameters:**

- `id` (number): role ID.

**Body Parameters (JSON):**

- `permissionIds` (number[], required): array of permission IDs to remove.

**Request Body:**

```json
{
  "permissionIds": [2, 3]
}
```

**Response:**

```json
{
  "count": 2
}
```

---

## Common Errors

- `400 Bad Request`: the `id` path parameter is not a valid number.
- `401 Unauthorized`: missing or invalid `Authorization` header.
- `404 Not Found`: role or permission not found.
- `409 Conflict`: duplicate role name when creating a role.
