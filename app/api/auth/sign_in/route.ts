import prisma from "@/src/utilities/client";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
// import twilio from "twilio";
// import { DateTime } from "luxon";

// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req: Request) {
  const { code, phone } = await req.json();

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      phone,
    },
    include: {
      accessCode: true,
    },
  });

  // Missing code
  if (!user.accessCode) {
    return NextResponse.json({
      success: false,
      message: "No code found. Please request a new code.",
    });
  }
  // Too many attempts
  else if (user.accessCode.attempts > 5) {
    await prisma.accessCode.delete({
      where: {
        userId: user.id,
      },
    });
    return NextResponse.json({
      success: false,
      message: "Number of attempts exceeded. Please request new code.",
    });
  }
  // Incorrect code
  else if (user.accessCode.code !== parseInt(code)) {
    await prisma.accessCode.update({
      where: {
        userId: user.id,
      },
      data: {
        attempts: user.accessCode.attempts + 1,
      },
    });
    return NextResponse.json({
      success: false,
      message: "Incorrect code",
    });
  }
  // Expired code (5 minutes)
  else if (Date.now() - user.accessCode.createdAt.getTime() > 5 * 60 * 1000) {
    await prisma.accessCode.delete({
      where: {
        userId: user.id,
      },
    });
    return NextResponse.json({
      success: false,
      message: "Code has expired. Please request a new code.",
    });
  }

  if (user && user.accessCode.code === parseInt(code)) {
    if (process.env.JWT_SECRET) {
      await prisma.accessCode.delete({
        where: {
          userId: user.id,
        },
      });
      return NextResponse.json({
        success: true,
        token: jwt.sign({ userId: user.id }, process.env.JWT_SECRET),
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
