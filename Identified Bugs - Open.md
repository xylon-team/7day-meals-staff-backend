# Open Issues — Staff Portal

**Audit date:** 2026-10-06  
**Branch:** `bug-fix` in the staff backend and staff frontend repositories.  
**Environment:** Local staff UI/backend using the normal configured database. No QA database was selected.  
**Prior report:** All findings in `Identified Bugs.md` were marked `[DONE]`; there were no remaining `[OPEN]` entries to carry forward. The issues below remain unresolved. A later follow-up also found and fixed the Meal Plan creation issue; see `Identified Bugs - Done.md`.

## Confirmed issues

### 1. Test/QA records are mixed into operational admin lists — Low / data cleanup

The live Users/Roles, Meal Plans, Suppliers, and Orders screens include Selenium, E2E, Codex QA, and other test-labelled rows. The previous audit also records two temporary staff accounts still present in the normal configured database. These records clutter operational lists and can be mistaken for real users/orders. No records were deleted or changed.

**Small next step:** Identify and remove only confirmed test records through an approved cleanup, or isolate them from the operational dataset.

## Needs profiling / confirmation

### 2. Meal/order list reads remain slow — Medium candidate

Repeated local calls observed `/order` at about 2.8 seconds and `/meal-plan` at 4.3–5.5 seconds; one pass measured other list reads between 2.8–4.3 seconds. The browser pass also showed longer waits on New Orders and Order Status. The separate Admin dashboard-stat delay was improved by parallelizing its independent reads. The remaining list delays are real, but timing alone does not distinguish query shape from remote database latency or transient network conditions.

**Next audit step:** Profile the slowest list endpoints and their Prisma queries before choosing a minimal fix.

### 3. Historical incomplete meal plans and repeated supplier records remain — Low / data cleanup

The live database contains five meal plans with no assigned meals (IDs 5, 7, 12, 13, and 27); four are available. IDs 5 and 7 have 3 and 1 linked orders respectively. The order API does not expose subscriptions. The create/edit workflow assigns meals in the same form, and the backend now rejects empty assignments; see finding 27 in `Identified Bugs - Done.md`. These historical rows remain unchanged pending record-level cleanup. A complete inactive sample plan, `Cinnamon Grove Weekly Table`, was added and verified as replacement test data.

The supplier list contains nine persisted rows, including six names sharing the same email and phone. Several names look test-like, but they could also represent branches. No supplier data was changed; the backend has no uniqueness constraint that establishes them as duplicates.

**Next audit step:** Confirm which historical test meal plans to permanently remove, keeping in mind ID 7 has an order reference; decide whether any matching supplier rows should be removed. The supplier Delete control is hidden because no backend DELETE endpoint exists; see finding 28 in `Identified Bugs - Done.md`.

## Audit coverage and limits

- Opened the Dashboard, Roles & Users, Permissions, Customers, Meals, Meal Plans, New Orders, Order Status, Suppliers, Settings, and My Profile pages as Admin. Inspected list/search/filter/detail and create/edit/delete dialog states where present; canceled all forms/dialogs without saving.
- Tested read-only API access for customers, orders, food items, meal plans, suppliers, settings, and both dashboard-stat endpoints.
- Staff permission levels were previously exercised and documented in `Identified Bugs.md` (Inventory Manager and low-access test role). This pass did not create/login as additional staff accounts, change permissions, or submit business mutations.
- The audit is a thorough manual and source review, not proof that every possible runtime defect has been found. A follow-up fixed the empty-plan write paths and hid the unsupported supplier Delete action; existing database rows remain for separately approved cleanup.
