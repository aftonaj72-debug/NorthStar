# Student Management API

## Overview

The application exposes typed tRPC procedures through the managed `/api/trpc` gateway. The following reference maps the procedures to the HTTP semantics required by the SOP. A browser client should use the generated `trpc` hooks; Postman users can use the equivalent HTTP paths in the collection supplied with this project.

## Student resource

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | integer | response only | Database primary key. |
| `studentId` | string | yes | 3–32 characters; unique. |
| `firstName` | string | yes | At least 2 characters. |
| `lastName` | string | yes | At least 2 characters. |
| `email` | string | yes | Valid email format; unique. |
| `phone` | string | no | Maximum 24 characters. |
| `course` | string | yes | At least 2 characters. |
| `yearLevel` | integer | yes | Range 1–8. |
| `status` | enum | yes | `active`, `inactive`, or `graduated`. |
| `enrollmentDate` | ISO date | yes | Stored as a UTC-compatible timestamp. |
| `createdAt` | timestamp | response only | Creation timestamp. |
| `updatedAt` | timestamp | response only | Last update timestamp. |

## Procedures

### List students

- Procedure: `students.list`
- Equivalent operation: `GET /api/items/`
- Input: `{ "search": "optional text" }`
- Output: an array of student records ordered by newest creation date.
- Search checks student ID, first name, last name, email, and course.

### Get one student

- Procedure: `students.get`
- Equivalent operation: `GET /api/items/{id}/`
- Input: `{ "id": 1 }`
- Output: one student record or `undefined` when the record does not exist.

### Create a student

- Procedure: `students.create`
- Equivalent operation: `POST /api/items/`
- Input: a complete student object excluding generated timestamps and ID.
- Output: the created record.
- Failure cases: `BAD_REQUEST` for invalid fields and `CONFLICT` for a duplicate student ID or email.

Example input:

```json
{
  "studentId": "STU-2024-025",
  "firstName": "Jordan",
  "lastName": "Rivera",
  "email": "jordan.rivera@example.com",
  "phone": "+1 415 555 0100",
  "course": "Information Systems",
  "yearLevel": 2,
  "status": "active",
  "enrollmentDate": "2024-09-01T00:00:00.000Z"
}
```

### Update a student

- Procedure: `students.update`
- Equivalent operation: `PUT/PATCH /api/items/{id}/`
- Input: `{ "id": 1, "data": { ...partial student fields } }`
- Output: the updated record.
- Failure cases: `NOT_FOUND` for an unknown ID, `BAD_REQUEST` for invalid fields, and `CONFLICT` for duplicate unique fields.

### Delete a student

- Procedure: `students.remove`
- Equivalent operation: `DELETE /api/items/{id}/`
- Input: `{ "id": 1 }`
- Output: `{ "success": true }`.
- Failure cases: `NOT_FOUND` for an unknown ID.

## Error handling

The client displays mutation errors using toast notifications. The server returns structured tRPC errors, which preserve the error code and a user-readable message. The database additionally enforces uniqueness for `studentId` and `email`, protecting the data even when a request bypasses the client.
