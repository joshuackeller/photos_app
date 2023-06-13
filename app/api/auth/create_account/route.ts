import prisma from "@/src/utilities/client";
import { NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req: Request) {
  const { phone, name } = await req.json();

  const phoneRegex = /^\+1\d{10}$/;
  const isValidPhone = phoneRegex.test(phone);

  if (typeof name !== "string" && name.length < 1)
    return NextResponse.json({ success: false, message: "Invalid name" });

  if (isValidPhone) {
    let account = await prisma.user.findUnique({
      where: { phone },
    });
    if (account) {
      return NextResponse.json({
        success: false,
        message: "Number already in use",
      });
    } else {
      const code = Math.floor(Math.random() * 900000) + 100000;
      account = await prisma.user.create({
        data: {
          phone,
          name,
          accessCode: {
            create: {
              code,
            },
          },
        },
      });

      await client.messages.create({
        body: `Your code is ${code}`,
        from: process.env.TWILIO_PHONE,
        to: phone,
      });
      return NextResponse.json({ success: true, message: "Message sent" });
    }
  } else {
    return NextResponse.json({ success: false, message: "Invalid phone" });
  }
}
