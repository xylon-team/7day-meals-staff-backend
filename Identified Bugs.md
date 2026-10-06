# Identified Bugs — Admin Staff Portal

**Date:** 2026-10-05  
**Environment:** Staff frontend at `http://localhost:3000`; staff backend at `http://localhost:8000`; both repositories checked out on `dev`. Frontend configured with `NEXT_PUBLIC_API_URL=http://localhost:8000`; backend was run with its normal `.env` configuration, not the QA configuration.  
**Access:** Admin login through the frontend succeeded. Credentials and session tokens are intentionally omitted.

## Bugs found

### 1. [DONE] Sidebar entries lead to missing pages — High

**Affected links:** Promotions (`/promotions`), Inventory (`/inventory`), Supply Requests (`/supply-requests`), Staff Members (`/staff`), Salary Management (`/salary`), Reports (`/reports`), and Logs (`/logs`).

**Reproduction:** Log in as admin and select any affected sidebar link.

**Observed:** Each link navigates to its URL and displays the Next.js “404 — This page could not be found” page. These modules are presented as available in the admin navigation but cannot be used.

**Resolved:** Removed sidebar entries for modules with no implemented page, and removed the dashboard’s “Create Request” action that navigated to the missing Supply Requests page. Existing Staff, Suppliers, and stock summary access remains through the implemented Users, Suppliers, and Dashboard pages. Verified that all 10 remaining sidebar destinations resolve to an app or pages route and that no links/actions remain for the seven missing destinations. Frontend TypeScript passes. ESLint still reports pre-existing hook/state and explicit `any` issues in Layout and Dashboard.

### 2. [DONE] Orders pages fail to load backend data and silently show sample orders — High

**Affected pages:** New Orders (`/new-orders`) and Order Status (`/orders`).

**Reproduction:** Open either page after admin login.

**Observed:** The browser console reports `Backend unavailable, returning mock orders data` / `Failed to fetch orders`. New Orders then displays four pending sample orders with dates from 2023; Order Status displays an empty accepted-orders view. The UI does not make the fallback obvious, so an admin can mistake sample/stale information for live order state. Order actions were not submitted.

**Resolved:** Removed the hardcoded order fallback so API failures now propagate. New Orders and Order Status display an explicit load-error message with a Retry button instead of sample orders or a misleading empty state. TypeScript passes; a focused simulated-503 check confirms `getOrders()` rejects without returning mock data. ESLint still reports existing `any` and unused-catch issues in the touched files.

### 3. [DONE] Dashboard inventory stats request was rejected for admin — Medium

**Reproduction:** Open Dashboard (`/dashboard`) as admin and inspect browser console.

**Observed:** The inventory dashboard request returned HTTP 401 and logged `Inventory stats unavailable`. Other dashboard cards rendered, but the inventory statistics were unavailable to the admin session.

**Resolved:** The endpoint now accepts Admin or Staff authentication. Staff access checks the existing `inventory_item_view` permission rather than the nonexistent `inventory_view` permission. The focused guard test passes for an Inventory Manager permission and verifies both auth guards are configured. A database-backed request could not be repeated because the normal Supabase endpoint was unreachable.

### 4. [DONE] Profile details remain stuck on a loading message — Medium

**Reproduction:** Open My Profile from the account menu.

**Observed:** The profile page continues to show “Loading profile details…” after waiting. The Edit Profile form can still be opened and displays populated fields, so profile data appears available to part of the UI while the details section never finishes loading.

**Resolved:** Bounded profile API loading to five seconds. If the request stalls or fails, the page now fills the form from the signed-in user’s stored identity and clears the loading state, so profile details remain usable. A focused timeout check passes for both stalled and successful requests; frontend TypeScript passes. ESLint still reports two pre-existing explicit `any` errors in this page. Browser login regression could not be completed because the frontend requires an email-formatted username and rejected the previously provided `admin_local` value before submitting.

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

### 7. [DONE] Demo staff login buttons do not authenticate against the normal configured database — Medium

**Reproduction:** On `/login`, click Catering Manager or Inventory Manager, then Sign In.

**Observed:** Both buttons prefilled credentials that were rejected as “Invalid credentials” in the normal configured environment. The demo affordances imply those accounts are ready to use, but neither worked here.

**Resolved:** Removed the nonfunctional Catering Manager and Inventory Manager demo buttons and their hardcoded credential values. The login page now tells staff to use credentials provided by their administrator; the regular email/password login remains available. Verified the demo labels and credential literals are absent while the normal login flow remains, and passed frontend TypeScript and focused ESLint checks. A live database login remains unavailable because the backend currently fails during startup while resolving `AdminOrStaffAuthGuard` in `StatModule`.

### 8. [DONE] Staff creation rejects legitimate multi-part names — Medium

**Reproduction:** In the admin staff creation form, enter a first or last name containing a space (for example, a two-word given name or surname).

**Observed:** The form rejects it with “must contain only letters.” Its validation accepts only ASCII letters, so names containing spaces, hyphens, apostrophes, or accented characters cannot be entered. No staff record was created from the invalid attempt.

**Resolved:** Replaced the ASCII-only name check with shared Unicode-aware validation for staff first and last names. It accepts multi-part names, apostrophes, hyphens, accented letters, and combining marks while rejecting empty names, digits, underscores, and malformed separators. Updated the inline validation message. Test cases passed for valid and invalid examples, and TypeScript plus ESLint on the validator passed. ESLint on the full users page still reports existing hook-order, unused variable, and other unrelated lint issues.

### 9. [DONE] Password recovery reveals whether a staff email exists — Medium security risk

**Reproduction:** Submit a non-existent email on `/forgot-password`.

**Observed:** The public form returned “No staff account associated with this email address.” This distinguishes registered staff emails from unregistered ones. The page also says it will send a “reset link,” while the actual workflow sends an OTP.

**Resolved:** Password recovery now returns the same generic response for existing and unknown emails, and for lookup or mail delivery failures. OTP creation and delivery still occur only for an existing account. Updated the page copy to say that an OTP will be sent if an account exists and removed the inaccurate reset-link wording. Four focused service tests passed for unknown email, known email, mail failure, and lookup failure; the backend builds and frontend TypeScript passes. A live request remains unavailable because the backend currently fails during startup while resolving `AdminOrStaffAuthGuard` in `StatModule`. Frontend ESLint still reports pre-existing unused imports and explicit `any` errors in the forgot-password page.

### 10. [DONE] Password reset does not invalidate existing staff sessions — High security risk (code review)

`StaffAuthService.resetPassword()` changes the password hash but does not increment `token_version`. The staff JWT strategy rejects old tokens only when their token version differs from the stored version. A password reset therefore does not revoke already-issued staff tokens. This flow was not submitted because completing it would require sending an OTP email to a real account.

**Resolved:** A successful OTP password reset now increments `token_version` in the same credential update that stores the new password. The existing staff JWT strategy rejects tokens whose version no longer matches. Added a focused test that verifies the reset update increments the version and invalidates reset OTPs. All five staff-auth service tests and the backend build pass. This was verified with mocked persistence; no real account password or session was changed.

### 11. [DONE] Customer mutation routes are missing authentication guards — Potential API security issue (code review)

`POST /customer`, `PATCH /customer/:id`, and `DELETE /customer/:id` have no controller-level auth guard, unlike the customer read routes. The current service methods are placeholders and return strings instead of changing records, so I did not send mutation requests. Add explicit authorization before those operations are implemented.

**Resolved:** Added the existing `AdminJwtAuthGuard` to customer create, update, and delete handlers, matching the existing customer read and deactivate routes. Added controller metadata checks for all three mutation handlers. The focused controller suite passes (4 tests) and the backend builds. No mutation request was sent because these service methods are placeholders. This staff follow-up and the earlier admin-portal findings above have no remaining open items from the initial audit.

## Staff permission test matrix

| Account type | Observed access |
|---|---|
| Inventory Manager, 45/61 permissions | Staff login succeeded; broad modules appeared in navigation; order data loaded; inventory dashboard stats returned 403. No order state was changed. |
| Lower-access `test` role, 12/61 permissions | Login succeeded; navigation showed Dashboard, Meals, Meal Plans, and Reports. Meals and Meal Plans eventually loaded (roughly 6–10 seconds); edit/delete controls were visible and delete confirmation was canceled. Direct New Orders navigation returned to Dashboard. |
| Both roles | Account menu showed `Staff` rather than the assigned role. Reload retained the session with Remember me unchecked. |

## Password recovery and mutation boundary

The unknown-email recovery case was submitted; it did not send mail because the address had no staff account. I did not request an OTP for a real account, reset a password, save settings, change permissions, change existing staff status, or accept/reject/update orders. The two temporary QA staff accounts remain in the normal configured database pending approval to permanently delete them.

---

# Fresh Branch Audit — 2026-10-06

**Branch:** `bug-fix` in the staff frontend and backend repositories. The customer repositories remain on `dev`; they were outside this staff-portal audit. The frontend was run locally. The backend compiled, then exited before opening its HTTP port while Nest created `StatModule`. The configured normal database was not reached, and no database records were changed.

## Newly identified findings

### A1. [DONE] Staff backend cannot start — Blocker

**Observed:** Nest exited with `UnknownDependenciesException`: `AdminOrStaffAuthGuard` requires `AdminJwtAuthGuard`, but Nest could not resolve that dependency while creating the guard for `StatModule`. The frontend admin login consequently returned “Failed to fetch.”

**Evidence:** `src/stats/stat.module.ts` imports `StaffAuthModule` and registers `PermissionsGuard`; `StaffAuthModule` provided `AdminJwtAuthGuard` but did not export it, while exporting the combined guard consumed by `StatModule`.

**Resolved:** Exported both JWT guards from `StaffAuthModule` so the combined guard’s dependencies resolve across module boundaries. Backend build and a focused `StatModule` dependency-injection test pass. A manual startup now initializes all modules and maps routes, then exits at Prisma with `P1001` because the normal configured Supabase host is unreachable from this environment. The original Nest dependency-injection defect is fixed; live HTTP verification remains blocked by database connectivity.

### A2. [DONE] Admin login exposes a demo credential autofill — Critical security risk

**Observed:** `/admin-login` renders a “Demo Admin Account” section with a “System Administrator” button. Selecting it fills a fixed administrator username and password embedded in the client bundle. The credential literals are in `pages/admin-login/page.tsx`; values are omitted here. This escaped the earlier hardcoded-credential finding, which only covered the staff API fallback helpers.

**Verification:** The browser displayed the demo button and clicking it populated the username and password fields without submitting the form.

**Resolved:** Removed the demo-account section, autofill handler, and embedded credential literals from the admin login page. Frontend TypeScript passes, the app source scan finds no remaining references to the demo credential/autofill, and a browser check confirms the admin login page now shows only the manual authentication form.

### A3. [DONE] API failures can masquerade as saved data — High

**Observed in code review:** Several frontend API helpers return local mock records when requests fail or are unauthorized. This includes customer, staff, role, supplier, and meal-plan reads. Staff, role, and supplier mutation helpers also catch failures and return/update in-memory mock data (including role permission assignment/removal and delete operations). The UI can therefore display demo records or report a mutation as successful although the configured backend did not save it. The fixed order fallback was only one instance of this broader pattern.

**Verification limit:** The backend could not be started, so these helper failure paths were confirmed from source, not exercised end to end through an authenticated browser session.

**Resolved:** Removed mock customer, staff, role, supplier, and meal-plan records and silent-success mutation fallbacks from the frontend API helpers. Failed HTTP responses now reject so existing page handlers can show errors. The Roles & Permissions page no longer starts with a fabricated default permission matrix; it shows a load error with Retry and disables saving until its data loads. Supplier status updates retain the current supplier only when the backend confirms success. Frontend TypeScript passes, a focused simulated-HTTP-503 harness confirms all 25 read/write helper failure paths reject, and the running UI still cannot be authenticated because the backend cannot reach the normal configured Supabase endpoint (P1001). No QA database was used and no DB records were changed.

### A4. [DONE] Admin order screens call staff-only API routes — High

**Observed in code review:** The Admin portal exposes New Orders and Order Status, but `src/order/order.controller.ts` applies only `StaffJwtAuthGuard` and `PermissionsGuard`. The frontend sends the signed-in user’s Admin JWT, which is not a staff JWT. Admin requests to `/order` and order status updates will therefore be rejected even when the Admin UI grants access. The order fallback removal from the earlier fix now makes the request failure visible instead of showing fabricated order data.

**Verification limit:** Not exercised over HTTP because the backend failed at startup. Controller guard metadata and frontend token handling were inspected.

**Resolved:** Order routes now use the combined Admin-or-Staff authentication guard. Existing `orders_view` and `orders_change` checks remain in place for staff, while the permissions guard’s existing Admin bypass allows Admin JWTs through. Registered the guard dependencies in `OrderModule`. Backend build passes; three focused tests pass for route guard/permission metadata, Admin permission bypass, and module dependency injection. End-to-end HTTP verification remains blocked by normal Supabase connectivity (P1001); no QA database or records were used.

### A5. [OPEN] Admin supplier screens call staff-only API routes — High

**Observed in code review:** The Admin portal exposes supplier management, but `src/supplier/supplier.controller.ts` uses only `StaffJwtAuthGuard` plus staff permissions. Admin requests use an Admin JWT, so supplier reads and writes will be rejected. `lib/api/supplier.ts` catches these failures and presents or mutates local mock suppliers, which can make admin changes appear successful without persistence.

**Verification limit:** Not exercised over HTTP because the backend failed at startup. Controller guard metadata, admin navigation permission bypass, and the frontend fallback behavior were inspected.

## Verification run

- Staff backend TypeScript build: passed.
- Staff backend startup: failed before listening, as described in A1.
- Staff backend Jest: 10 suites passed; 3 suites could not load because `@nestjs/mapped-types` is ESM while the current Jest transform attempts to load it as CommonJS. The 10 runnable suites reported 47 passing tests.
- Staff frontend TypeScript: passed.
- Staff frontend ESLint: failed with 57 errors and 41 warnings across the project.
- Staff frontend production build: failed because Next.js could not fetch the Geist and Geist Mono Google Fonts in this network-restricted environment.
- Browser: Admin login page loaded; submission failed with “Failed to fetch” because the backend was not listening. No successful admin or staff login was possible in this pass.

## Audit boundary

The authenticated Admin, Inventory Manager, and lower-permission staff feature matrix could not be re-run because of A1. No create, update, delete, permission, order, or settings action was submitted. The two temporary staff QA accounts mentioned above remain in the normal configured database; they were not deleted during this audit.
