import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  createStudent,
  deleteStudent,
  getStudentByEmail,
  getStudentById,
  getStudentByStudentId,
  listStudents,
  updateStudent,
} from "./db";

const statusSchema = z.enum(["active", "inactive", "graduated"]);
const studentFields = {
  studentId: z.string().trim().min(3, "Student ID is required").max(32),
  firstName: z.string().trim().min(2, "First name must be at least 2 characters").max(80),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email address").max(320),
  phone: z.string().trim().max(24).optional().or(z.literal("")),
  course: z.string().trim().min(2, "Course is required").max(120),
  yearLevel: z.number().int().min(1, "Year level must be between 1 and 8").max(8, "Year level must be between 1 and 8"),
  status: statusSchema,
  enrollmentDate: z.coerce.date(),
};
const studentInput = z.object(studentFields);
const studentUpdateInput = studentInput.partial();

function duplicateError(message: string) {
  return new TRPCError({ code: "CONFLICT", message });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  students: router({
    list: publicProcedure.input(z.object({ search: z.string().optional() }).optional()).query(({ input }) => listStudents(input?.search)),
    get: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(({ input }) => getStudentById(input.id)),
    create: publicProcedure.input(studentInput).mutation(async ({ input }) => {
      if (await getStudentByStudentId(input.studentId)) throw duplicateError("That student ID is already in use.");
      if (await getStudentByEmail(input.email)) throw duplicateError("That email address is already in use.");
      return createStudent({ ...input, phone: input.phone || null });
    }),
    update: publicProcedure.input(z.object({ id: z.number().int().positive(), data: studentUpdateInput })).mutation(async ({ input }) => {
      const current = await getStudentById(input.id);
      if (!current) throw new TRPCError({ code: "NOT_FOUND", message: "Student record not found." });
      if (input.data.studentId && input.data.studentId !== current.studentId && (await getStudentByStudentId(input.data.studentId))) {
        throw duplicateError("That student ID is already in use.");
      }
      if (input.data.email && input.data.email.toLowerCase() !== current.email.toLowerCase() && (await getStudentByEmail(input.data.email))) {
        throw duplicateError("That email address is already in use.");
      }
      const updated = await updateStudent(input.id, { ...input.data, phone: input.data.phone || null });
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Student record not found." });
      return updated;
    }),
    remove: publicProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const removed = await deleteStudent(input.id);
      if (!removed) throw new TRPCError({ code: "NOT_FOUND", message: "Student record not found." });
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
