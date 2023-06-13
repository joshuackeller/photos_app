import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { secret } = await req.json();
  if (secret !== process.env.SECRET) throw Error("Incorrect");

  if (process.env.JWT_SECRET) {
    const token = jwt.sign({}, process.env.JWT_SECRET);
    return NextResponse.json({ token });
  } else {
    throw Error("JWT key not available");
  }
}
