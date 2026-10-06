# Fixed Issues — Staff Portal

**Updated:** 2026-10-06  
**Scope:** Historical admin and staff findings from `Identified Bugs.md`, which were all marked `[DONE]`, plus the fixes made during the fresh branch audit. This file records the reported issue and the change that resolved it; it does not imply every change was re-tested against a live account/database.

## Admin portal findings

1. **Sidebar linked to missing pages.** Removed links to unimplemented modules and the dashboard action pointing to a missing supply-requests page. Verified the remaining destinations resolve.
2. **Order pages silently showed sample data after API failure.** Removed mock order fallback and added visible load errors with retry controls.
3. **Admin could not load inventory dashboard statistics.** Allowed the combined Admin/Staff guard and aligned the staff permission check with `inventory_item_view`.
4. **Profile stayed on a loading message after a failed/stalled request.** Added a bounded request and a signed-in identity fallback that clears loading state.

## Staff login and permissions findings

5. **Hardcoded administrator credentials were used as a frontend fallback.** Removed credential fallback code from staff, dashboard, and customer API helpers; authenticated staff APIs are used instead.
6. **Staff could open admin-only user and role pages directly.** Added an Admin-only page guard.
7. **Inventory Manager was denied inventory dashboard statistics.** Corrected the permission key and registered the combined authentication/permissions guards.
8. **Navigation and page/API authorization disagreed.** Hid admin-only links for staff, protected direct customer/settings/supplier access, and gated supplier actions by their permissions.
9. **Staff identity appeared as generic “Staff.”** Loaded the authenticated staff profile and displayed its name/assigned role labels while retaining staff authorization identity.
10. **“Remember me” had no effect.** Persisted unchecked staff sessions in `sessionStorage` and checked sessions in `localStorage`.
11. **Demo staff-login buttons used unavailable accounts.** Removed the buttons and their fixed credentials; clarified that staff should use administrator-provided credentials.
12. **Staff name validation rejected legitimate names.** Added Unicode-aware validation for multi-part names, apostrophes, hyphens, and accented characters.
13. **Password recovery revealed whether an email existed.** Returned a generic response for known/unknown addresses and updated the UI to describe the OTP workflow accurately.
14. **Password reset left old staff sessions valid.** Incremented `token_version` as part of a successful password reset.
15. **Customer mutation routes lacked authentication.** Added the existing Admin JWT guard to create/update/delete handlers. Their service implementation remains incomplete; see the open-issues report.

## Fresh branch audit fixes

16. **Backend could not initialize `StatModule`.** Exported the JWT guards required by `AdminOrStaffAuthGuard`; subsequent startup passed Nest dependency resolution. Live API access was later confirmed during this audit.
17. **Admin login page exposed demo credential autofill.** Removed the demo account UI, autofill, and embedded credential literals.
18. **API failures could look like successful reads/writes.** Removed mock records and silent-success fallbacks for customer, staff, role, supplier, and meal-plan helpers; added explicit permission-matrix load/retry behavior.
19. **Admin order pages called staff-only endpoints.** Switched order routes to the combined Admin/Staff guard while retaining staff permission checks and Admin bypass.
20. **Admin supplier pages called staff-only endpoints.** Switched supplier routes to the combined guard, registered its dependencies, retained staff permission checks, and removed the Selenium-login fallback.

## Follow-up fixes

21. **Customer order counts displayed as zero.** Added the related-order count to the customer directory API response and taught the frontend mapper to read Prisma's `_count.orders`. Verified against the live API (19 customers, 34 orders, 11 customers with orders) and the staff UI, where nonzero counts appeared and matched the returned counts.
22. **Customer activation appeared successful without saving.** Added a validated `is_active` update and persisted it through Prisma. The unimplemented customer create/delete routes now return HTTP 501 instead of success-looking placeholder strings. Focused customer-service tests (17) and backend build passed. Manually activated the synthetic test customer in the staff UI, reloaded to verify it stayed active, then deactivated it; a final API read confirmed its original inactive state was restored.
23. **Admin profile exposed unsupported edit/password controls.** Since the Admin identity is fixed, hid profile editing and password-change controls for Admin while retaining them for Staff, and changed the Admin page copy to say its details are read-only. Frontend TypeScript passes; manual browser verification showed neither control on the Admin profile page.
24. **Icon-only controls were inaccessible by name/state.** Added accessible names and pressed/state semantics to meal, meal-plan, staff, and supplier status switches and to password-visibility controls across login/profile screens. Frontend TypeScript passes; browser accessibility trees expose named switches with current values, and the staff password toggle changes from “Show password” to “Hide password” with its pressed state. The forgot-password email/OTP flow was not submitted.

## Verification notes

- During the 2026-10-06 audit, the staff backend and frontend were available locally on the `bug-fix` branches. Admin login succeeded through the normal configured database.
- Read-only API checks returned 19 customers, 34 orders, 10 food items, 11 meal plans, and 9 suppliers; both dashboard-stat endpoints also returned successfully.
- Prior focused tests/build results are preserved in `Identified Bugs.md`. Some earlier live checks were blocked at that time; this audit's successful reads confirm the backend now starts and reaches the configured database.
- No business data mutations were submitted in this audit. Login updates the admin `last_logged_in` field as part of the existing authentication flow.
