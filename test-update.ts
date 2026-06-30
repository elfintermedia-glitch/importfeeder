import { eq } from "drizzle-orm";
import { db } from "./src/db/index.js";
import { students, users } from "./src/db/schema.js";
import { sql } from "drizzle-orm";

async function test() {
  const user = await db.query.users.findFirst();
  if (!user) return;
  const student = await db.query.students.findFirst({ where: eq(students.userId, user.id) });
  if (!student) return;
  
  const updateData = { ...student };
  delete updateData.id;
  delete updateData.userId;
  delete updateData.createdAt;

  try {
    await db.update(students).set(updateData).where(sql`${students.userId} = ${user.id} AND ${students.nim} = ${student.nim}`);
    console.log("Success");
  } catch(e) {
    console.error("FAIL:", e);
  }
}
test();
