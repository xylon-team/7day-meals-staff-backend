# Order Endpoints

Order endpoints are defined in `src/order/order.controller.ts`.

- **Base path:** `/order`
- **Authentication:** All routes require `Authorization: Bearer <staff_jwt>` and are protected by `StaffJwtAuthGuard` and `PermissionsGuard`.

---

## Legend

Parameters are labeled by location:

- **Path** — URL path segment (`:id`)
- **Query** — URL query string (`?key=value`)
- **Body** — JSON request body

---

## Data Models

### Customer Order

```json
{
  "order_id": number,
  "customer_id": number,
  "meal_id": number,
  "order_timestamp": string (ISO 8601 datetime),
  "delivery_person_id": number | null,
  "order_status": string,
  "payment_status": string,
  "delivery_status": string,
  "delivery_preferred_date": string (ISO 8601 datetime),
  "is_a_subscribed_meal": boolean,
  "offer_id": number | null
}
```

### Update Order (partial)

All fields are optional. Only provided fields are updated.

```json
{
  "customer_id": number,
  "meal_id": number,
  "delivery_person_id": number,
  "order_status": string,
  "payment_status": string,
  "delivery_status": string,
  "delivery_preferred_date": string (ISO 8601 datetime),
  "is_a_subscribed_meal": boolean,
  "offer_id": number
}
```

---

## Table of Contents

- [1. List all orders](#1-list-all-orders)
- [2. Get order by ID](#2-get-order-by-id)
- [3. Update order](#3-update-order)

---

## Endpoints

### 1. List all orders

**Endpoint:** `GET /order`

**Description:** Retrieves a list of all customer orders. Supports optional query filters to narrow results. Multiple filters can be combined.

**Query Parameters:**

- `customer_id` (number, optional): Filter orders by customer ID.
- `meal_id` (number, optional): Filter orders by meal ID.
- `delivery_person_id` (number, optional): Filter orders by delivery person ID.
- `order_status` (string, optional): Filter orders by order status (e.g., `pending`, `preparing`, `delivered`).
- `delivery_status` (string, optional): Filter orders by delivery status (e.g., `pending`, `delivered`).
- `is_a_subscribed_meal` (string, optional): Filter by subscription status. Pass `"true"` or `"false"`.
- `offer_id` (number, optional): Filter orders by offer ID.

**Permissions:** `orders_view`

**Response:**

```json
[
  {
    "order_id": 1,
    "customer_id": 1,
    "meal_id": 1,
    "order_timestamp": "2026-07-16T09:19:29.085Z",
    "delivery_person_id": null,
    "order_status": "pending",
    "payment_status": "paid",
    "delivery_status": "pending",
    "delivery_preferred_date": "2026-07-17T09:19:29.085Z",
    "is_a_subscribed_meal": false,
    "offer_id": null
  },
  {
    "order_id": 2,
    "customer_id": 2,
    "meal_id": 2,
    "order_timestamp": "2026-07-16T09:19:29.085Z",
    "delivery_person_id": null,
    "order_status": "preparing",
    "payment_status": "paid",
    "delivery_status": "pending",
    "delivery_preferred_date": "2026-07-17T09:19:29.085Z",
    "is_a_subscribed_meal": false,
    "offer_id": null
  },
  "..."
]
```

**Example with filters:**

```
GET /order?customer_id=1&order_status=delivered&delivery_status=delivered
```

---

### 2. Get order by ID

**Endpoint:** `GET /order/:id`

**Description:** Retrieves a single customer order by its order ID.

**Path Parameters:**

- `id` (number): Order ID.

**Permissions:** `orders_view`

**Response:**

```json
{
  "order_id": 1,
  "customer_id": 1,
  "meal_id": 1,
  "order_timestamp": "2026-07-16T09:19:29.085Z",
  "delivery_person_id": null,
  "order_status": "pending",
  "payment_status": "paid",
  "delivery_status": "pending",
  "delivery_preferred_date": "2026-07-17T09:19:29.085Z",
  "is_a_subscribed_meal": false,
  "offer_id": null
}
```

---

### 3. Update order

**Endpoint:** `PATCH /order/:id`

**Description:** Updates a customer order. Only provided fields are updated; omitted fields remain unchanged.

**Path Parameters:**

- `id` (number): Order ID.

**Permissions:** `orders_change`

**Body Parameters (JSON):**

- `customer_id` (number, optional): The customer who placed the order.
- `meal_id` (number, optional): The meal associated with the order.
- `delivery_person_id` (number, optional): The delivery person assigned to the order.
- `order_status` (string, optional): The current status of the order (e.g., `pending`, `preparing`, `delivered`).
- `payment_status` (string, optional): The payment status (e.g., `paid`, `unpaid`).
- `delivery_status` (string, optional): The delivery status (e.g., `pending`, `delivered`).
- `delivery_preferred_date` (string, optional): Preferred delivery date in ISO 8601 format.
- `is_a_subscribed_meal` (boolean, optional): Whether the order is a subscribed meal.
- `offer_id` (number, optional): The offer applied to the order.

**Request Body (full update example):**

```json
{
  "customer_id": 2,
  "meal_id": 3,
  "order_status": "delivered",
  "payment_status": "unpaid",
  "delivery_status": "delivered",
  "delivery_preferred_date": "2026-08-15T10:00:00.000Z",
  "is_a_subscribed_meal": true
}
```

**Request Body (partial update — status only):**

```json
{
  "order_status": "preparing"
}
```

**Response:**

```json
{
  "order_id": 1,
  "customer_id": 2,
  "meal_id": 3,
  "order_timestamp": "2026-07-16T09:19:29.085Z",
  "delivery_person_id": null,
  "order_status": "preparing",
  "payment_status": "unpaid",
  "delivery_status": "delivered",
  "delivery_preferred_date": "2026-08-15T10:00:00.000Z",
  "is_a_subscribed_meal": true,
  "offer_id": null
}
```

---

## Common Errors

- `400 Bad Request`: One or more referenced records (customer, meal, delivery person, or offer) do not exist. Also returned for invalid request body validation.
- `401 Unauthorized`: Missing or invalid staff JWT token.
- `403 Forbidden`: Staff user does not have the required permission (`orders_view` for GET endpoints, `orders_change` for PATCH endpoint).
- `404 Not Found`: Order with the specified ID does not exist.
