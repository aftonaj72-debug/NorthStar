Northstar Student Management System
Northstar is a complete CRUD-based student management application built for the
attached full-stack development SOP. It provides a responsive student directory with
create, read, update, and delete operations; server-side validation; search; status
summaries; database persistence; and project documentation.
Technology stack
The managed project uses the supported full-stack WebDev template: React  index.css # Visual system and responsive layout
 App.tsx # Application routing and providers
drizzle/
 schema.ts # users and students table definitions
 migrations/ # Generated SQL migrations
server/
 db.ts # Database access and demo fallback
 routers.ts # Typed CRUD procedures and validation
 *.test.ts # Vitest coverage
shared/
 ... # Shared runtime constants
docs/
 API.md # Endpoint/procedure reference
 PROJECT_REPORT.md # Submission-ready project report
 TEST_CASES.md # Test plan and expected results
 ER_DIAGRAM.md # Mermaid entity relationship diagram
 postman_collection.json # API demonstration collection
Local setup
 CRUD contract
The browser uses typed tRPC procedures under /api/trpc rather than a hand-written Axios
layer. The procedure names and equivalent REST semantics are documented in
docs/API.md. The client invalidates the list query after every successful mutation, so the
visible table stays synchronized with the database.
Security and quality notes
Server-side validation remains authoritative even though the form also uses native browser
validation. Student ID and email are unique at both the procedure and database levels.
Passwords, API keys, and database credentials are not stored in source control. ORM
operations are parameterized through Drizzle. Authentication plumbing is supplied by the
managed template and can be enabled for protected procedures when the project is
deployed to a real institution workflow.
Submission contents
The project includes source code, schema and migration files, implementation
documentation, a report, an ER diagram, test cases, and a Postman collection. The UI is
designed for desktop and mobile breakpoints and is ready for a live demonstration of all
four CRUD operations.
pnpm check
Run the TypeScript compiler without
emitting files.
pnpm test Run the Vitest suite.
pnpm build Build the client and production server bundle.
pnpm db:push Generate and apply Drizzle migrations.
pnpm format Format project files with Prettier.
