# Meal Plan Endpoints

Meal plan endpoints are defined in `src/meal-plan/meal-plan.controller.ts`.

- **Base path:** `/meal-plan`
- **Authentication:** All routes require `Authorization: Bearer <staff_jwt>` and are protected by `StaffJwtAuthGuard`. Each route additionally requires a specific permission via `PermissionsGuard`.

---

## Legend

Parameters are labeled by location:

- **Path** — URL path segment (`:id`)
- **Query** — URL query string (`?key=value`)
- **Body** — JSON request body

---

## Data Models

### Meal Plan

```json
{
  "meal_id": number,
  "item_name": string,
  "category": string,
  "description": string,
  "dietary_preference": string,
  "price": number,
  "image_path": string | null,
  "is_available": boolean
}
```

### Food Item

```json
{
  "food_item_id": number,
  "item_name": string,
  "ingredient_list": string,
  "image_path": string | null,
  "is_available": boolean,
  "price": number
}
```

### Meal Plan Food Item (association)

```json
{
  "meal_id": number,
  "food_item_id": number,
  "day": string,
  "meal_type": string,
  "food_item": FoodItem
}
```

### Meal Plan with food items

All `GET` responses and the `POST`/`PATCH` response bodies include the related `food_items` array with nested `food_item` data.

```json
{
  "meal_id": number,
  "item_name": string,
  "category": string,
  "description": string,
  "dietary_preference": string,
  "price": number,
  "image_path": string | null,
  "is_available": boolean,
  "food_items": MealPlanFoodItem[]
}
```

### Create Meal Plan Body

```json
{
  "mealPlan": {
    "item_name": string,
    "category": string,
    "description": string,
    "dietary_preference": string,
    "price": number,
    "image_path": string,
    "is_available": boolean
  },
  "foodItems": {
    "food_item_id": number,
    "day": string,
    "meal_type": string
  }[]
}
```

### Update Meal Plan Body

All `mealPlan` fields are optional. `foodItems` is optional; if omitted, existing associations are left untouched. If provided as an empty array, all associations are removed.

```json
{
  "mealPlan": {
    "item_name": string,
    "category": string,
    "description": string,
    "dietary_preference": string,
    "price": number,
    "image_path": string,
    "is_available": boolean
  },
  "foodItems": {
    "food_item_id": number,
    "day": string,
    "meal_type": string
  }[]
}
```

---

## Table of Contents

- [1. Create a meal plan](#1-create-a-meal-plan)
- [2. List all meal plans](#2-list-all-meal-plans)
- [3. Get meal plan by ID](#3-get-meal-plan-by-id)
- [4. Update meal plan](#4-update-meal-plan)

---

## Endpoints

### 1. Create a meal plan

**Endpoint:** `POST /meal-plan`

**Description:** Creates a new meal plan and optionally associates one or more food items with it. The `meal_id` on each food item is taken from the created meal plan (any value sent by the client is ignored). All operations run inside a transaction.

**Required permission:** `meal_package_add`

**Body Parameters (JSON):**

- `mealPlan` (object, required): the meal plan to create.
  - `item_name` (string, required): name of the meal plan.
  - `category` (string, required): category of the meal plan.
  - `description` (string, required): description of the meal plan.
  - `dietary_preference` (string, required): dietary preference label.
  - `price` (number, required): price; must be `>= 0`.
  - `image_path` (string, optional): path to an image.
  - `is_available` (boolean, optional): defaults to `true` when omitted.
- `foodItems` (array, optional): food item associations to create alongside the meal plan.
  - `food_item_id` (number, required): ID of an existing food item.
  - `day` (string, required): day of the week (e.g. `"Monday"`).
  - `meal_type` (string, required): meal type (e.g. `"Breakfast"`).

**Request Body:**

```json
{
  "mealPlan": {
    "item_name": "Weekly Veggie Plan",
    "category": "Vegetarian",
    "description": "7-day vegetarian meal plan",
    "dietary_preference": "vegetarian",
    "price": 150
  },
  "foodItems": [
    { "food_item_id": 1, "day": "Monday", "meal_type": "Breakfast" },
    { "food_item_id": 2, "day": "Tuesday", "meal_type": "Lunch" }
  ]
}
```

**Response:**

```json
{
  "meal_id": 14,
  "item_name": "Weekly Veggie Plan",
  "category": "Vegetarian",
  "description": "7-day vegetarian meal plan",
  "dietary_preference": "vegetarian",
  "price": 150,
  "image_path": null,
  "is_available": true,
  "food_items": [
    {
      "meal_id": 14,
      "food_item_id": 1,
      "day": "Monday",
      "meal_type": "Breakfast",
      "food_item": {
        "food_item_id": 1,
        "item_name": "Test Salad",
        "ingredient_list": "Lettuce, Tomato",
        "image_path": null,
        "is_available": true,
        "price": 9.99
      }
    },
    {
      "meal_id": 14,
      "food_item_id": 2,
      "day": "Tuesday",
      "meal_type": "Lunch",
      "food_item": {
        "food_item_id": 2,
        "item_name": "Grilled Chicken",
        "ingredient_list": "Chicken, Olive Oil",
        "image_path": null,
        "is_available": true,
        "price": 12.5
      }
    }
  ]
}
```

---

### 2. List all meal plans

**Endpoint:** `GET /meal-plan`

**Description:** Returns all meal plans, each with its associated food items (and nested food item details).

**Required permission:** `meal_package_view`

**Parameters:** None

**Response:**

```json
[
  {
    "meal_id": 1,
    "item_name": "Weekly Veggie Plan",
    "category": "Vegetarian",
    "description": "7-day vegetarian meal plan",
    "dietary_preference": "vegetarian",
    "price": 150,
    "image_path": null,
    "is_available": true,
    "food_items": []
  },
  {
    "meal_id": 14,
    "item_name": "Weekly Veggie Plan",
    "category": "Vegetarian",
    "description": "7-day vegetarian meal plan",
    "dietary_preference": "vegetarian",
    "price": 150,
    "image_path": null,
    "is_available": true,
    "food_items": [
      {
        "meal_id": 14,
        "food_item_id": 1,
        "day": "Monday",
        "meal_type": "Breakfast",
        "food_item": {
          "food_item_id": 1,
          "item_name": "Test Salad",
          "ingredient_list": "Lettuce, Tomato",
          "image_path": null,
          "is_available": true,
          "price": 9.99
        }
      }
    ]
  }
]
```

---

### 3. Get meal plan by ID

**Endpoint:** `GET /meal-plan/:id`

**Description:** Returns a single meal plan by numeric ID, including its associated food items (and nested food item details).

**Required permission:** `meal_package_view`

**Path Parameters:**

- `id` (number): meal plan ID.

**Response:**

```json
{
  "meal_id": 14,
  "item_name": "Weekly Veggie Plan",
  "category": "Vegetarian",
  "description": "7-day vegetarian meal plan",
  "dietary_preference": "vegetarian",
  "price": 150,
  "image_path": null,
  "is_available": true,
  "food_items": [
    {
      "meal_id": 14,
      "food_item_id": 1,
      "day": "Monday",
      "meal_type": "Breakfast",
      "food_item": {
        "food_item_id": 1,
        "item_name": "Test Salad",
        "ingredient_list": "Lettuce, Tomato",
        "image_path": null,
        "is_available": true,
        "price": 9.99
      }
    }
  ]
}
```

---

### 4. Update meal plan

**Endpoint:** `PATCH /meal-plan/:id`

**Description:** Updates a meal plan's fields and/or replaces its food item associations. All operations run inside a transaction.

`foodItems` behavior:
- **Omitted** — existing food item associations are left untouched.
- **Empty array (`[]`)** — all existing associations are removed.
- **Non-empty array** — all existing associations are removed and replaced with the new ones. Each entry must reference an existing `food_item_id`. Duplicate `(food_item_id, day, meal_type)` combinations within the array are rejected.

**Required permission:** `meal_package_change`

**Path Parameters:**

- `id` (number): meal plan ID.

**Body Parameters (JSON):**

- `mealPlan` (object, required): fields to update on the meal plan. All fields are optional; only provided fields are changed.
  - `item_name` (string, optional): new name.
  - `category` (string, optional): new category.
  - `description` (string, optional): new description.
  - `dietary_preference` (string, optional): new dietary preference.
  - `price` (number, optional): new price; must be `>= 0`.
  - `image_path` (string, optional): new image path.
  - `is_available` (boolean, optional): new availability flag.
- `foodItems` (array, optional): new food item associations to replace the existing ones.
  - `food_item_id` (number, required): ID of an existing food item.
  - `day` (string, required): day of the week.
  - `meal_type` (string, required): meal type.

**Request Body:**

```json
{
  "mealPlan": {
    "item_name": "Updated Veggie Plan",
    "price": 175
  },
  "foodItems": [
    { "food_item_id": 1, "day": "Wednesday", "meal_type": "Dinner" }
  ]
}
```

**Response:**

```json
{
  "meal_id": 14,
  "item_name": "Updated Veggie Plan",
  "category": "Vegetarian",
  "description": "7-day vegetarian meal plan",
  "dietary_preference": "vegetarian",
  "price": 175,
  "image_path": null,
  "is_available": true,
  "food_items": [
    {
      "meal_id": 14,
      "food_item_id": 1,
      "day": "Wednesday",
      "meal_type": "Dinner",
      "food_item": {
        "food_item_id": 1,
        "item_name": "Test Salad",
        "ingredient_list": "Lettuce, Tomato",
        "image_path": null,
        "is_available": true,
        "price": 9.99
      }
    }
  ]
}
```

---

## Common Errors

- `400 Bad Request`: the `id` path parameter is not a valid number; a required field is missing or has the wrong type in the request body; one or more referenced `food_item_id` values do not exist in the database.
- `401 Unauthorized`: missing or invalid `Authorization` header, or the token was issued for a non-staff account.
- `403 Forbidden`: the authenticated staff user does not have the permission required by the route.
- `404 Not Found`: no meal plan exists with the given `id`.
- `409 Conflict`: the `foodItems` array contains duplicate `(food_item_id, day, meal_type)` combinations that violate the composite primary key.
