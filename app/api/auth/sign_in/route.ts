import prisma from "@/src/utilities/client";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req: Request) {
  const { code, phone } = await req.json();

  const account = await prisma.user.findFirst({
    where: {
      phone,
      accessCode: {
        code,
      },
    },
  });

  if (account) {
    if (process.env.JWT_SECRET) {
      return NextResponse.json({
        success: true,
        token: jwt.sign({ accountId: account.id }, process.env.JWT_SECRET),
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "Could not create token",
      });
    }
  } else {
    return NextResponse.json({
      success: false,
      message: "Incorrect phone or code",
    });
  }
}
