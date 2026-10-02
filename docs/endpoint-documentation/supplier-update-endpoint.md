# Update supplier

`PATCH /suppliers/:id` requires a staff JWT and `supplier_change` permission.
The supplier ID must be a positive integer.

Send any subset of `name`, `agent_name`, `email`, `phone_number`,
`address_line_1`, `address_line_2`, and `address_line_3`.
Contact strings are trimmed. Name, agent name, and phone number cannot be blank
or null; email must be valid. Address fields can be set to null to clear them.
Omitted fields are preserved. Identifiers and supplier status cannot be changed.

Optional `inventory_items` replaces the complete supplied item list. Each entry
requires a unique, existing, positive integer `inventory_id` and accepts a boolean
`is_available` (default true). Omit the list to preserve links; send `[]` to clear them.
This endpoint changes supplier item links, not inventory stock or item metadata.

```json
{
  "email": "supplier@example.com",
  "phone_number": "+94771234567",
  "inventory_items": [
    { "inventory_id": 2, "is_available": true },
    { "inventory_id": 3, "is_available": false }
  ]
}
```

Returns 200 with the updated supplier and `inventory_items` links.
Returns 400 for invalid input, empty updates, or unknown inventory items;
404 for a missing supplier; 401/403 for authentication/permission failures.
Contact and supplied item changes are saved atomically.
