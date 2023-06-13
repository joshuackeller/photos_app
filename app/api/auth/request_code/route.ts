import prisma from "@/src/utilities/client";
import { NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req: Request) {
  const { phone } = await req.json();

  const phoneRegex = /^\+1\d{10}$/;
  const isValidPhone = phoneRegex.test(phone);

  let user = await prisma.user.findUniqueOrThrow({
    where: {
      phone,
    },
    include: {
      accessCode: true,
    },
  });

  if (isValidPhone && !!user) {
    const code = Math.floor(Math.random() * 900000) + 100000;
    if (user?.accessCode?.code) {
      await prisma.user.update({
        where: { phone },
        data: { accessCode: { delete: true } },
      });
    }
    await prisma.user.update({
      where: { phone },
      data: { accessCode: { create: { code } } },
    });

    await client.messages.create({
      body: `Your code is ${code}`,
      from: process.env.TWILIO_PHONE,
      to: phone,
    });
    return NextResponse.json({ success: true, message: "Message sent" });
  } else {
    if (!isValidPhone)
      return NextResponse.json({ success: false, message: "Invalid phone" });
    if (!user)
      return NextResponse.json({ success: false, message: "No user found" });
  }
}
