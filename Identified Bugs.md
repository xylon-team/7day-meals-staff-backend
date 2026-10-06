# Identified Bugs — Admin Staff Portal

**Date:** 2026-10-05  
**Environment:** Staff frontend at `http://localhost:3000`; staff backend at `http://localhost:8000`; both repositories checked out on `dev`. Frontend configured with `NEXT_PUBLIC_API_URL=http://localhost:8000`; backend was run with its normal `.env` configuration, not the QA configuration.  
**Access:** Admin login through the frontend succeeded. Credentials and session tokens are intentionally omitted.

## Bugs found

### 1. Sidebar entries lead to missing pages — High

**Affected links:** Promotions (`/promotions`), Inventory (`/inventory`), Supply Requests (`/supply-requests`), Staff Members (`/staff`), Salary Management (`/salary`), Reports (`/reports`), and Logs (`/logs`).

**Reproduction:** Log in as admin and select any affected sidebar link.

**Observed:** Each link navigates to its URL and displays the Next.js “404 — This page could not be found” page. These modules are presented as available in the admin navigation but cannot be used.

### 2. Orders pages fail to load backend data and silently show sample orders — High

**Affected pages:** New Orders (`/new-orders`) and Order Status (`/orders`).

**Reproduction:** Open either page after admin login.

**Observed:** The browser console reports `Backend unavailable, returning mock orders data` / `Failed to fetch orders`. New Orders then displays four pending sample orders with dates from 2023; Order Status displays an empty accepted-orders view. The UI does not make the fallback obvious, so an admin can mistake sample/stale information for live order state. Order actions were not submitted.

### 3. [DONE] Dashboard inventory stats request was rejected for admin — Medium

**Reproduction:** Open Dashboard (`/dashboard`) as admin and inspect browser console.

**Observed:** The inventory dashboard request returned HTTP 401 and logged `Inventory stats unavailable`. Other dashboard cards rendered, but the inventory statistics were unavailable to the admin session.

**Resolved:** The endpoint now accepts Admin or Staff authentication. Staff access checks the existing `inventory_item_view` permission rather than the nonexistent `inventory_view` permission. The focused guard test passes for an Inventory Manager permission and verifies both auth guards are configured. A database-backed request could not be repeated because the normal Supabase endpoint was unreachable.

### 4. Profile details remain stuck on a loading message — Medium

**Reproduction:** Open My Profile from the account menu.

**Observed:** The profile page continues to show “Loading profile details…” after waiting. The Edit Profile form can still be opened and displays populated fields, so profile data appears available to part of the UI while the details section never finishes loading.

## Areas exercised

- **Dashboard:** summary cards and charts rendered; inventory stats error noted above.
- **Roles & Users:** role and user lists loaded; Create Role and Create User forms opened and canceled.
- **Permissions:** role selector and permission matrix loaded; no permissions were changed.
- **Customers:** customer list, search, and customer profile panel worked.
- **Meals:** list, search, availability/price filters, Add Meal form, Edit Meal form, and delete confirmation opened. Forms/confirmation were canceled.
- **Meal Plans:** list and Create/Edit Plan forms loaded; delete confirmation opened. Forms/confirmation were canceled.
- **Suppliers:** list, Add/Edit Supplier forms and delete confirmation loaded; forms/confirmation were canceled. Active-state switches were left unchanged.
- **Settings:** delivery settings eventually loaded (the page first showed a loading state); no settings were saved.
- **My Profile:** account menu and Edit Profile form worked; profile details loading issue noted above.
- **Orders:** list/search/filter UI was inspected; no accept/reject action was submitted.
- **Unavailable modules:** the seven broken sidebar destinations listed above were tested and each returned 404.

## Test boundary

This was a manual browser pass through the admin-visible interface. To protect records in the normal configured database, I did not submit create, edit, delete, order accept/reject, status-toggle, permission-save, settings-save, or password-change actions. Forms and confirmation dialogs were opened where safe, then canceled. This report covers browser-observable behavior; it is not an automated test-suite result.

---

# Staff Login and Permission-Level Follow-up

**Date:** 2026-10-05  
**Environment:** The staff login flow was audited on local `dev` checkouts with the normal backend `.env` configuration. Fixes below were made on local `bug-fix` branches. Two temporary active staff accounts were created for the audit, one assigned to **Inventory Manager** (45/61 permissions) and one to the lower-access **test** role (12/61 permissions). They are temporary QA accounts; removal is pending because deleting staff records from the normal configured database requires explicit confirmation. No existing staff or customer records were changed.

## Bugs and risks found

### 1. [DONE] Administrator credentials were embedded in the staff frontend — Critical security risk (code review)

`lib/api/staff.ts` contained a fixed administrator login fallback used from the browser to load staff permissions/profile data. **Resolved:** Removed that fallback, along with the same pattern in the dashboard and customer API helpers. Staff profile and permission calls now use staff-authenticated endpoints. A scan found no such fallback in application source. The account password was not rotated, and credential literals remain in existing test scripts; neither is included in the application bundle.

### 2. [DONE] Staff could open admin-only screens by direct URL — High

**Reproduction:** Sign in with the low-access `test` role, then navigate directly to `/users` or `/roles`.

**Observed:** `/users` rendered role/user management controls, including Create Role and Create User. `/roles` rendered the permission matrix and Save Changes control. The navigation hid these links for the low-access role, but the pages did not deny access. The backend role/staff APIs remain admin-guarded.

**Resolved:** Added an Admin-only route guard for both pages. It denies staff before the page components mount, including staff accounts with role-related permissions, consistent with the backend guards. Component checks confirmed low-access staff and permission-bearing staff are denied while Admin is allowed. Browser checks confirmed Admin can still open both routes. A live browser check with a staff login could not be completed because the normal Supabase connection was unavailable.

### 3. [DONE] Inventory Manager could not load its inventory dashboard stats — High

**Reproduction:** Sign in with the Inventory Manager role and open Dashboard.

**Observed:** `GET /stats/inventory-dashboard` returned 403 and the dashboard logged `Inventory stats unavailable`. The role’s visible inventory permissions are based on `inventory_item_*`, while this API required `inventory_view`; the Inventory Manager role had 45/61 permissions but was still rejected. Other dashboard summary cards rendered.

**Resolved:** The API now checks `inventory_item_view`, uses the combined Admin/staff authentication guard, and registers the permissions guard in the stats module. Backend build and focused permission-guard tests passed. Live database-backed verification remains unavailable while the normal Supabase endpoint is unreachable.

### 4. [DONE] Permission-filtered navigation and page authorization disagreed — High

**Observed:** The low-access role’s sidebar correctly hid Orders, Inventory, Suppliers, Staff, Settings, and user-management links. However:

- It still showed **Reports**, even though the section is marked admin-only; selecting it led to a 404.
- Direct navigation to `/suppliers` and `/customers` bypassed the menu filter. Both pages continued showing “Loading …” after more than five seconds, and the Suppliers page still exposed Add Supplier.
- Direct `/settings` access showed “Failed to fetch settings from the server” alongside editable-looking default values.

The API guards prevented successful protected reads in these cases, but the frontend does not give a clear permission-denied state and can leave staff with misleading controls or spinners.

**Resolved:** Navigation now hides sections marked `adminOnly` from staff, and the Suppliers link requires `supplier_view`. Direct `/customers` and `/settings` access is Admin-only; `/suppliers` waits for staff permissions and requires `supplier_view` before mounting. Supplier add, edit/status, and delete controls are shown only with their matching permissions. Component checks passed for denied/allowed/pending supplier access, admin-only navigation, and Add Supplier visibility. A live staff-browser/database check remains unavailable because the normal Supabase endpoint could not be reached.

### 5. [DONE] Staff identity is displayed as generic “Staff” and the email local-part — Medium

**Reproduction:** Sign in with either temporary role account.

**Observed:** The account menu showed role `Staff` and used the email local-part as the display name, regardless of the assigned role or the staff member’s actual first/last name. The profile edit form later showed the stored name and role permissions were applied, so this is a presentation/identity mapping bug rather than a login failure.

**Resolved:** Staff login now loads `/staff-auth/me` using the newly issued staff token and displays the name and all assigned role labels from that profile. The display role is stored separately from the authorization role so a staff-assigned label cannot grant admin UI access. Verified the authenticated profile request and response mapping (including multiple roles and HTTP errors), verified the store updates the identity while retaining `Staff` authorization, and passed frontend TypeScript and focused ESLint checks. A live browser/database login could not be completed because the backend currently fails during startup while resolving `AdminOrStaffAuthGuard` in `StatModule`.

### 6. [DONE] “Remember me” does not control session persistence — Medium

**Reproduction:** Sign in with the checkbox left unchecked, then reload the page.

**Observed:** The staff session remained active. The UI presents a Remember me checkbox, but session state is persisted in local storage independently of it.

**Resolved:** The staff login checkbox now selects the persistence store: unchecked sessions use `sessionStorage` and end with the browser tab session, while checked sessions use `localStorage` and survive browser restarts. Changing the choice clears the old copy before persisting the new session. Verified the unchecked and checked paths, simulated store rehydration after reload for both, and confirmed Admin login retains its existing persistent behavior. Frontend TypeScript and focused ESLint checks passed. A live browser/database login remains unavailable because the backend currently fails during startup while resolving `AdminOrStaffAuthGuard` in `StatModule`.

### 7. Demo staff login buttons do not authenticate against the normal configured database — Medium

**Reproduction:** On `/login`, click Catering Manager or Inventory Manager, then Sign In.

**Observed:** Both buttons prefilled credentials that were rejected as “Invalid credentials” in the normal configured environment. The demo affordances imply those accounts are ready to use, but neither worked here.

### 8. Staff creation rejects legitimate multi-part names — Medium

**Reproduction:** In the admin staff creation form, enter a first or last name containing a space (for example, a two-word given name or surname).

**Observed:** The form rejects it with “must contain only letters.” Its validation accepts only ASCII letters, so names containing spaces, hyphens, apostrophes, or accented characters cannot be entered. No staff record was created from the invalid attempt.

### 9. Password recovery reveals whether a staff email exists — Medium security risk

**Reproduction:** Submit a non-existent email on `/forgot-password`.

**Observed:** The public form returned “No staff account associated with this email address.” This distinguishes registered staff emails from unregistered ones. The page also says it will send a “reset link,” while the actual workflow sends an OTP.

### 10. Password reset does not invalidate existing staff sessions — High security risk (code review)

`StaffAuthService.resetPassword()` changes the password hash but does not increment `token_version`. The staff JWT strategy rejects old tokens only when their token version differs from the stored version. A password reset therefore does not revoke already-issued staff tokens. This flow was not submitted because completing it would require sending an OTP email to a real account.

### 11. Customer mutation routes are missing authentication guards — Potential API security issue (code review)

`POST /customer`, `PATCH /customer/:id`, and `DELETE /customer/:id` have no controller-level auth guard, unlike the customer read routes. The current service methods are placeholders and return strings instead of changing records, so I did not send mutation requests. Add explicit authorization before those operations are implemented.

## Staff permission test matrix

| Account type | Observed access |
|---|---|
| Inventory Manager, 45/61 permissions | Staff login succeeded; broad modules appeared in navigation; order data loaded; inventory dashboard stats returned 403. No order state was changed. |
| Lower-access `test` role, 12/61 permissions | Login succeeded; navigation showed Dashboard, Meals, Meal Plans, and Reports. Meals and Meal Plans eventually loaded (roughly 6–10 seconds); edit/delete controls were visible and delete confirmation was canceled. Direct New Orders navigation returned to Dashboard. |
| Both roles | Account menu showed `Staff` rather than the assigned role. Reload retained the session with Remember me unchecked. |

## Password recovery and mutation boundary

The unknown-email recovery case was submitted; it did not send mail because the address had no staff account. I did not request an OTP for a real account, reset a password, save settings, change permissions, change existing staff status, or accept/reject/update orders. The two temporary QA staff accounts remain in the normal configured database pending approval to permanently delete them.
