# Database Changes

## Table of Contents
- [TODOs](#todos)
  - [Fix staff_role_permission table structure](#fix-staff_role_permission-table-structure)
- [Schema Changes](#schema-changes)
  - [Changed phone_number type in customer](#changed-phone_number-type-in-customer)
  - [Changed registration_date type in customer](#changed-registration_date-type-in-customer)
  - [Changed phone_number type in delivery_person](#changed-phone_number-type-in-delivery_person)
  - [Changed expiry_date type in offer](#changed-expiry_date-type-in-offer)
  - [Changed date fields in complaint](#changed-date-fields-in-complaint)
  - [Changed phone_number type in staff](#changed-phone_number-type-in-staff)
  - [Changed phone_number type in supplier](#changed-phone_number-type-in-supplier)
  - [Changed expiry_date type in inventory_item](#changed-expiry_date-type-in-inventory_item)
  - [Changed date fields in stock_adjustment](#changed-date-fields-in-stock_adjustment)
  - [Changed date fields in supplier_request](#changed-date-fields-in-supplier_request)
  - [Changed date type in purchase_order](#changed-date-type-in-purchase_order)
  - [Renamed password field in staff_credential](#renamed-password-field-in-staff_credential)

## TODOs

### Fix staff_role_permission table structure
- **Table**: staff_role_permission
- **Issue**: Current ternary relationship design is incorrect for standard RBAC pattern
- **Note**: Table structure needs to be redesigned to properly implement role-based access control

## Schema Changes

### Changed phone_number type in customer
- **Table**: customer
- **Field**: phone_number
- **Change**: INT → VARCHAR(15)
- **Reason**: Phone numbers should be strings to preserve leading zeros and special characters (+, -, spaces)

### Changed registration_date type in customer
- **Table**: customer
- **Field**: registration_date
- **Change**: DATE → DateTime
- **Reason**: To store both date and time of registration

### Changed phone_number type in delivery_person
- **Table**: delivery_person
- **Field**: phone_number
- **Change**: INT → VARCHAR(15)
- **Reason**: Phone numbers should be strings to preserve leading zeros and special characters (+, -, spaces)

### Changed expiry_date type in offer
- **Table**: offer
- **Field**: expiry_date
- **Change**: DATE → DateTime
- **Reason**: To store both date and time for offer expiration

### Changed date fields in complaint
- **Table**: complaint
- **Fields**: date_submitted, resolved_date
- **Change**: DATE → DateTime
- **Reason**: To store both date and time for complaint tracking

### Changed phone_number type in staff
- **Table**: staff
- **Field**: phone_number
- **Change**: INT → VARCHAR(15)
- **Reason**: Phone numbers should be strings to preserve leading zeros and special characters (+, -, spaces)

### Changed phone_number type in supplier
- **Table**: supplier
- **Field**: phone_number
- **Change**: INT → VARCHAR(15)
- **Reason**: Phone numbers should be strings to preserve leading zeros and special characters (+, -, spaces)

### Changed expiry_date type in inventory_item
- **Table**: inventory_item
- **Field**: expiry_date
- **Change**: DATE → DateTime
- **Reason**: To store both date and time for inventory tracking

### Changed date fields in stock_adjustment
- **Table**: stock_adjustment
- **Fields**: expiry_date, entered_date
- **Change**: DATE → DateTime
- **Reason**: To store both date and time for stock adjustment tracking

### Changed date fields in supplier_request
- **Table**: supplier_request
- **Fields**: requested_date, required_date
- **Change**: DATE → DateTime
- **Reason**: To store both date and time for supplier request tracking

### Changed date type in purchase_order
- **Table**: purchase_order
- **Field**: date
- **Change**: DATE → DateTime
- **Reason**: To store both date and time for purchase order tracking

### Renamed password field in staff_credential
- **Table**: staff_credential
- **Field**: customer_password → staff_password
- **Reason**: Consistent naming with staff table
