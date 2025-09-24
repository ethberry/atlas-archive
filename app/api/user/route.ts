import { NextResponse } from "next/server";
// import {PostgrestError} from "@supabase/supabase-js";
import { ZodError } from "zod";

import { createUser } from "../../../lib/db/models/users";
import { validationSchema } from "../../saft/validation";

export async function POST(req: Request) {
  const json = await req.json();

  try {
    const body = validationSchema.parse(json);

    const data = await createUser(body);
    return NextResponse.json(data);
  } catch (error) {
    // @ts-ignore
    if ("code" in error) {
      if (error.code === "23505") {
        return NextResponse.json({ error }, { status: 409 });
      }
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ error }, { status: 500 });
  }
}
