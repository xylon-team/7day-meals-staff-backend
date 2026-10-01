# Customer endpoints

These endpoints require an admin JWT in `Authorization: Bearer <token>`.
Missing, invalid, expired, or unrecognized admin credentials return `401`.

## GET /customer

Returns `200` with an array of registered customer records, newest registration
first (customer ID descending breaks ties). Returns `[]` when none exist.
Inactive and soft-deleted accounts remain visible for support and auditing.

Each record contains the customer model fields, including contact details,
address, coordinates, registration date, and account status flags.
`credential` contains only `{ "email": "user@example.com" }`, or `null` when
the customer has no credential. Passwords and token versions are excluded.

## GET /customer/:id

Returns `200` with the customer profile, using the same fields and safe email
projection as the directory. Inactive and soft-deleted profiles remain available.
No order, subscription, complaint, or notification histories are loaded.

The ID must be a positive integer within PostgreSQL's 32-bit integer range
(1 through 2147483647). Invalid IDs return `400`; a valid ID without a matching
customer returns `404` with `Customer with ID <id> not found`.
