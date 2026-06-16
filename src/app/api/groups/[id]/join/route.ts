import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    console.error("Join attempt without session");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: clubId } = await params;
  const userId = (session.user as any).id;
  
  console.log(`Join attempt: User ${userId} joining Club ${clubId}`);

  try {
    // Verify user exists to avoid foreign key violations
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      console.error(`User not found in DB: ${userId}`);
      return NextResponse.json({ error: "User session is invalid. Please sign out and sign in again." }, { status: 401 });
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!club) {
      console.error(`Club not found: ${clubId}`);
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const existingMembership = await prisma.clubMembership.findUnique({
      where: {
        userId_clubId: { userId, clubId },
      },
    });

    if (existingMembership) {
      return NextResponse.json({ message: "Already a member", clubId });
    }

    // Mitosis: Capped at 50 members per group
    if (club._count.members >= 50) {
      const parentId = club.parentId || club.id;
      const sisters = await prisma.club.findMany({
        where: { parentId },
        include: {
          _count: {
            select: { members: true },
          },
        },
      });

      const existingSister = sisters.find((s) => s._count.members < 50);
      let targetClubId: string;

      if (existingSister) {
        targetClubId = existingSister.id;
      } else {
        const newClub = await prisma.club.create({
          data: {
            name: `${club.name.split(" (Sister")[0]} (Sister ${club.generation + 1})`,
            description: club.description,
            genre: club.genre,
            generation: club.generation + 1,
            parentId,
          },
        });
        targetClubId = newClub.id;
      }

      await prisma.clubMembership.create({
        data: { userId, clubId: targetClubId },
      });

      return NextResponse.json({
        message: existingSister
          ? "Group was full. You've been joined to a sister group."
          : "Group was full. A new sister group has been born for you.",
        clubId: targetClubId,
        mitosis: true,
      });
    }

    // Normal join
    await prisma.clubMembership.create({
      data: { userId, clubId },
    });

    return NextResponse.json({ message: "Joined group", clubId });
  } catch (error) {
    console.error("Join group error:", error);
    return NextResponse.json({ error: "Failed to join group" }, { status: 500 });
  }
}
