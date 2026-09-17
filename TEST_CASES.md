# Test Cases and Expected Results

The following matrix is the manual and automated test plan for the Student Management System. Automated checks are run with `pnpm test`, `pnpm check`, and `pnpm build`. UI cases are verified against the managed preview at desktop and mobile widths.

| ID | Area | Test | Expected result |
| --- | --- | --- | --- |
| TC-01 | Startup | Start the development server. | The server starts without TypeScript or runtime errors. |
| TC-02 | Read | Open the dashboard with database connectivity. | Student records and summary counts are displayed. |
| TC-03 | Search | Search by name, email, student ID, or course. | Matching rows remain visible and non-matching rows are hidden. |
| TC-04 | Create | Submit a complete valid student record. | A new row is persisted and appears in the directory after refresh. |
| TC-05 | Create | Submit with an empty required field. | Native form validation prevents submission; the server also rejects invalid input. |
| TC-06 | Create | Submit an invalid email. | The form and server reject the value with a clear message. |
| TC-07 | Create | Submit a year level outside 1–8. | The server returns a validation error. |
| TC-08 | Create | Submit a duplicate student ID or email. | The server returns a conflict error and the original data remains unchanged. |
| TC-09 | Update | Edit a record and save valid changes. | The row reflects the changed values and the updated timestamp changes. |
| TC-10 | Update | Update a missing record ID. | The server returns `NOT_FOUND`; no record is created. |
| TC-11 | Delete | Confirm deletion of an existing record. | The row is removed from the database and directory. |
| TC-12 | Delete | Attempt to delete an invalid ID. | The server returns `NOT_FOUND`. |
| TC-13 | Error state | Stop or disconnect the backend. | The UI shows an error state and a retry action. |
| TC-14 | Responsive UI | Open at 375px width. | The sidebar collapses, controls remain usable, and the table scrolls horizontally. |
| TC-15 | Accessibility | Navigate form controls with the keyboard. | Controls have visible focus states and labeled actions. |
| TC-16 | Build | Run `pnpm build`. | Vite and the server bundle complete successfully. |

## Automated coverage

`server/auth.logout.test.ts` verifies that logout clears the managed session cookie with secure options. `server/students.test.ts` verifies that malformed create input is rejected by the typed server contract and that list results have the expected student fields when the demo fallback is active.

## Test result record

The final verification run should record the date, command, and result below. The project delivery includes the commands used by the agent in its completion summary.

| Command | Result |
| --- | --- |
| `pnpm check` | Passed with no TypeScript errors |
| `pnpm test` | Passed: 2 files and 3 tests |
| `pnpm build` | Passed; client and server bundles created |
| Visual desktop review | Passed at 1280×900 |
| Visual mobile review | Passed at 375×812 |
