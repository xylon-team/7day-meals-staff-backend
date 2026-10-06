# Open Issues — Staff Portal

**Audit date:** 2026-10-06  
**Branch:** `bug-fix` in the staff backend and staff frontend repositories.  
**Environment:** Local staff UI/backend using the normal configured database. No QA database was selected.  
**Scope:** Admin and staff permission levels, including read, navigation, filtering/search, and create/edit/delete form states where accessible. Delays in loading and repeated supplier contact/address data are accepted by the user and are excluded from findings. Existing testing data was left intact.

## Confirmed issues

### 1. Staff dashboard fails or renders blank for non-admin roles — High

The staff dashboard requests `/stats/admin-dashboard` for roles with relevant module permissions. That endpoint is Admin-guarded, so staff requests receive HTTP 401; the dashboard's combined load then fails even though other permitted module endpoints respond successfully. This reproduced for `test`, `e2e-test-role`, Inventory Manager, Manager, and a fully permissioned `test-admin2` account. Direct API checks with a staff JWT returned 200 for `/order`, `/food-items`, and `/meal-plan`, and 401 for `/stats/admin-dashboard`.

A role with meal-plan-only permissions (`meal_plan_manager`) instead lands on a blank dashboard: it triggers no dashboard-stat request, and the page shows neither module cards nor a no-permissions/empty state.

**Affected behavior:** Staff cannot use the dashboard as a landing page; some roles see an error and at least one role sees a blank page despite having access to meal-plan features.

## Role coverage and observed results

| Staff role | Observed coverage/results |
|---|---|
| `meal_plan_manager` | Dashboard blank; Meal Plans loads, and create form opens/cancels; unrelated protected routes are denied. |
| `test` | Dashboard load error. |
| `e2e-test-role` | Dashboard load error; Orders and New Orders load; Meals supports view/edit/availability controls while add/delete are absent, matching its grants. |
| Inventory Manager | Dashboard load error; Suppliers loads with add/edit/status controls; the Settings menu issue was fixed in code (browser re-verification blocked in this session). |
| Manager | Dashboard load error; Meals search/filter works and add/edit/delete dialogs open and cancel; the Settings menu issue was fixed in code (browser re-verification blocked in this session). |
| `test-admin2` (all permissions) | Dashboard load error; direct `/users` navigation redirects to Dashboard, consistent with the Admin-only page guard. |
| Admin | Existing Admin route and read-only API audit is recorded in `Identified Bugs - Done.md`; this audit specifically added non-admin coverage. |

All opened business forms/dialogs were canceled without submitting writes. No existing orders, meals, meal plans, suppliers, or customer data were changed. Test account IDs 74–80 from the preceding browser pass were absent from the current staff list; deletion requests returned 404 because those records were already absent. No other staff record was targeted for cleanup.

## Audit coverage and limits

- Browser-tested login and permissions across the six staff role types above, including role-specific list routes, relevant controls, and direct navigation to protected pages.
- Checked staff API access for Orders, Food Items, Meal Plans, and the Admin dashboard endpoint with a staff token to isolate the dashboard failure.
- Inspected available create/edit/delete UI states and canceled without saving. This was a manual usability/authorization audit, not destructive CRUD verification for every module and every permission combination.
- Loading time and duplicated supplier address/contact data were deliberately excluded because the user said both are acceptable. Existing test/QA records were preserved.
- This is a broad manual audit, not proof that every possible runtime defect has been found. The dashboard issue remains open and was not changed during the Settings fix.

