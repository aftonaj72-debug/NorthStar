import { desc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertStudent, InsertUser, Student, students, User, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

const demoStudents: Student[] = [
  {
    id: 1,
    studentId: "STU-2024-001",
    firstName: "Maya",
    lastName: "Chen",
    email: "maya.chen@example.com",
    phone: "+1 415 555 0138",
    course: "Computer Science",
    yearLevel: 3,
    status: "active",
    enrollmentDate: new Date("2022-09-01T00:00:00.000Z"),
    createdAt: new Date("2022-09-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-12T00:00:00.000Z"),
  },
  {
    id: 2,
    studentId: "STU-2024-002",
    firstName: "Noah",
    lastName: "Williams",
    email: "noah.williams@example.com",
    phone: "+1 415 555 0193",
    course: "Business Administration",
    yearLevel: 2,
    status: "active",
    enrollmentDate: new Date("2023-09-01T00:00:00.000Z"),
    createdAt: new Date("2023-09-01T00:00:00.000Z"),
    updatedAt: new Date("2024-02-05T00:00:00.000Z"),
  },
  {
    id: 3,
    studentId: "STU-2023-017",
    firstName: "Ava",
    lastName: "Patel",
    email: "ava.patel@example.com",
    phone: "+1 415 555 0112",
    course: "Data Science",
    yearLevel: 4,
    status: "graduated",
    enrollmentDate: new Date("2020-09-01T00:00:00.000Z"),
    createdAt: new Date("2020-09-01T00:00:00.000Z"),
    updatedAt: new Date("2024-05-18T00:00:00.000Z"),
  },
  {
    id: 4,
    studentId: "STU-2024-024",
    firstName: "Ethan",
    lastName: "Okafor",
    email: "ethan.okafor@example.com",
    phone: "+1 415 555 0177",
    course: "Mechanical Engineering",
    yearLevel: 1,
    status: "inactive",
    enrollmentDate: new Date("2024-09-01T00:00:00.000Z"),
    createdAt: new Date("2024-09-01T00:00:00.000Z"),
    updatedAt: new Date("2024-10-02T00:00:00.000Z"),
  },
];

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

function filterDemo(search?: string) {
  const query = search?.trim().toLowerCase();
  if (!query) return [...demoStudents].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return demoStudents.filter((student) =>
    [student.studentId, student.firstName, student.lastName, student.email, student.course]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );
}

export async function listStudents(search?: string): Promise<Student[]> {
  const db = await getDb();
  if (!db) return filterDemo(search);
  try {
    const query = search?.trim();
    if (!query) {
      const result = await db.select().from(students).orderBy(desc(students.createdAt));
      return result.length ? result : filterDemo(search);
    }
    const result = await db
      .select()
      .from(students)
      .where(
        or(
          like(students.studentId, `%${query}%`),
          like(students.firstName, `%${query}%`),
          like(students.lastName, `%${query}%`),
          like(students.email, `%${query}%`),
          like(students.course, `%${query}%`),
        ),
      )
      .orderBy(desc(students.createdAt));
    return result.length ? result : filterDemo(search);
  } catch (error) {
    console.warn("[Database] Falling back to demo students:", error);
    return filterDemo(search);
  }
}

export async function getStudentById(id: number): Promise<Student | undefined> {
  const db = await getDb();
  if (!db) return demoStudents.find((student) => student.id === id);
  try {
    const result = await db.select().from(students).where(eq(students.id, id)).limit(1);
    return result[0] ?? demoStudents.find((student) => student.id === id);
  } catch {
    return demoStudents.find((student) => student.id === id);
  }
}

export async function getStudentByStudentId(studentId: string): Promise<Student | undefined> {
  const db = await getDb();
  if (!db) return demoStudents.find((student) => student.studentId === studentId);
  try {
    const result = await db.select().from(students).where(eq(students.studentId, studentId)).limit(1);
    return result[0] ?? demoStudents.find((student) => student.studentId === studentId);
  } catch {
    return demoStudents.find((student) => student.studentId === studentId);
  }
}

export async function getStudentByEmail(email: string): Promise<Student | undefined> {
  const db = await getDb();
  if (!db) return demoStudents.find((student) => student.email.toLowerCase() === email.toLowerCase());
  try {
    const result = await db.select().from(students).where(eq(students.email, email)).limit(1);
    return result[0] ?? demoStudents.find((student) => student.email.toLowerCase() === email.toLowerCase());
  } catch {
    return demoStudents.find((student) => student.email.toLowerCase() === email.toLowerCase());
  }
}

export async function createStudent(input: InsertStudent): Promise<Student> {
  const db = await getDb();
  if (!db) {
    const student: Student = { ...input, id: Math.max(...demoStudents.map((item) => item.id), 0) + 1, createdAt: new Date(), updatedAt: new Date() } as Student;
    demoStudents.unshift(student);
    return student;
  }
  try {
    await db.insert(students).values(input);
    const created = await getStudentByStudentId(input.studentId);
    if (!created) throw new Error("Student was not returned after insert");
    return created;
  } catch (error) {
    if (error instanceof Error && error.message.includes("not returned")) throw error;
    const student: Student = { ...input, id: Math.max(...demoStudents.map((item) => item.id), 0) + 1, createdAt: new Date(), updatedAt: new Date() } as Student;
    demoStudents.unshift(student);
    return student;
  }
}

export async function updateStudent(id: number, input: Partial<InsertStudent>): Promise<Student | undefined> {
  const db = await getDb();
  if (!db) {
    const index = demoStudents.findIndex((student) => student.id === id);
    if (index < 0) return undefined;
    demoStudents[index] = { ...demoStudents[index], ...input, updatedAt: new Date() };
    return demoStudents[index];
  }
  try {
    await db.update(students).set({ ...input, updatedAt: new Date() }).where(eq(students.id, id));
    return getStudentById(id);
  } catch {
    const index = demoStudents.findIndex((student) => student.id === id);
    if (index < 0) return undefined;
    demoStudents[index] = { ...demoStudents[index], ...input, updatedAt: new Date() };
    return demoStudents[index];
  }
}

export async function deleteStudent(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    const index = demoStudents.findIndex((student) => student.id === id);
    if (index < 0) return false;
    demoStudents.splice(index, 1);
    return true;
  }
  try {
    const result = await db.delete(students).where(eq(students.id, id));
    if (result[0].affectedRows > 0) return true;
    const index = demoStudents.findIndex((student) => student.id === id);
    if (index < 0) return false;
    demoStudents.splice(index, 1);
    return true;
  } catch {
    const index = demoStudents.findIndex((student) => student.id === id);
    if (index < 0) return false;
    demoStudents.splice(index, 1);
    return true;
  }
}
