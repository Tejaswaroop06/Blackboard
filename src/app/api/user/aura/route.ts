import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        auraColor: true,
        auraSound: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch aura" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { auraColor, auraSound } = await req.json();

    const user = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        auraColor,
        auraSound,
      },
    });

    return NextResponse.json({ 
      auraColor: user.auraColor, 
      auraSound: user.auraSound 
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update aura" }, { status: 500 });
  }
}
