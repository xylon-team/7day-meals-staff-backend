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
