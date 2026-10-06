# Open Issues — Staff Portal

**Audit date:** 2026-10-06  
**Branch:** `bug-fix` in the staff backend and staff frontend repositories.  
**Environment:** Local staff UI/backend using the normal configured database. No QA database was selected.  
**Prior report:** All findings in `Identified Bugs.md` were marked `[DONE]`; there were no remaining `[OPEN]` entries to carry forward. The newly identified issues below remain unresolved. No fixes were made during this audit.

## Confirmed issues

### 1. Admin profile exposes controls that cannot update the Admin account — Medium

The Admin login stores no user ID, and the profile page treats the Admin as a staff profile: profile save calls `/staff/:id`, while password change calls `/staff-auth/me/password`, which is staff-token-only. With no Admin ID, profile save throws “User ID is missing”; the Admin JWT also cannot use the staff password endpoint. The page still presents Edit Profile and Change Password controls. Confirmed by tracing the login/store/API paths; forms were not submitted.

**Small next step:** Hide unsupported controls for Admin or add Admin-specific profile/password endpoints and route the page by account type.

### 2. Test/QA records are mixed into operational admin lists — Low / data cleanup

The live Users/Roles, Meal Plans, Suppliers, and Orders screens include Selenium, E2E, Codex QA, and other test-labelled rows. The previous audit also records two temporary staff accounts still present in the normal configured database. These records clutter operational lists and can be mistaken for real users/orders. No records were deleted or changed.

**Small next step:** Identify and remove only confirmed test records through an approved cleanup, or isolate them from the operational dataset.

### 3. Icon-only controls have no accessible name — Low / accessibility

Availability and staff-status switches, plus password-visibility buttons, are rendered as icon/switch buttons without `aria-label` or equivalent accessible text. The browser accessibility tree exposes the table switches as unnamed buttons, so screen-reader users cannot tell which record/control they operate or its state.

**Small next step:** Add record-specific accessible labels and switch state semantics (`role="switch"`, `aria-checked`) where appropriate.

## Needs profiling / confirmation

### 4. Slow API reads cause long loading states — Medium candidate

One live timing pass observed approximately 2.8–5.6 seconds for ordinary list reads (`/customer`, `/order`, `/food-items`, `/meal-plan`, `/suppliers`) and 6.6–10.1 seconds for dashboard statistics. The browser pass also showed longer waits on the New Orders and Order Status screens. These are real user-visible delays, but a single local timing pass cannot establish whether the cause is query shape, remote database latency, or transient network conditions.

**Next audit step:** Repeat timings over several runs, separate backend/database latency from frontend loading, then inspect the slowest query before choosing a minimal fix.

### 5. Meal-plan and supplier lists contain apparent incomplete/test data — Low candidate

The live Meal Plans list included several records with zero meals, missing week ranges, or zero prices; the Supplier list included repeated test-like entries. This may be deliberate draft/test data rather than a validation defect, so it is not classified as a confirmed application bug. No records were edited.

**Next audit step:** Confirm the intended rules for publishable meal plans and supplier uniqueness, then decide whether the rows are test-data cleanup or missing validation.

## Audit coverage and limits

- Opened the Dashboard, Roles & Users, Permissions, Customers, Meals, Meal Plans, New Orders, Order Status, Suppliers, Settings, and My Profile pages as Admin. Inspected list/search/filter/detail and create/edit/delete dialog states where present; canceled all forms/dialogs without saving.
- Tested read-only API access for customers, orders, food items, meal plans, suppliers, settings, and both dashboard-stat endpoints.
- Staff permission levels were previously exercised and documented in `Identified Bugs.md` (Inventory Manager and low-access test role). This pass did not create/login as additional staff accounts, change permissions, or submit business mutations.
- The audit is a thorough manual and source review, not proof that every possible runtime defect has been found. No code fixes, test-data cleanup, or commits were made for these open findings.
