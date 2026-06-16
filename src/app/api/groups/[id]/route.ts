import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: clubId } = await params;
    const session = await getServerSession(authOptions);

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        posts: {
          include: {
            author: {
              select: { pseudonym: true }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: { members: true }
        }
      }
    });

    if (!club) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Determine oldest membership (creator)
    const memberships = await prisma.clubMembership.findMany({
      where: { clubId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { pseudonym: true }
        }
      },
      take: 1
    });
    const creator = memberships[0]?.user?.pseudonym || "Unknown";

    // Determine if current user is a member
    let isMember = false;
    if (session?.user) {
      const userId = (session.user as any).id;
      console.log(`Checking membership: User ${userId}, Club ${clubId}`);
      const membership = await prisma.clubMembership.findUnique({
        where: {
          userId_clubId: { userId, clubId }
        }
      });
      isMember = !!membership;
      console.log(`Result: isMember = ${isMember}`);
    } else {
      console.log("No session found in GET /api/groups/[id]");
    }

    return NextResponse.json({ ...club, isMember, creator });
  } catch (error) {
    console.error("Fetch group error:", error);
    return NextResponse.json({ error: "Failed to fetch group" }, { status: 500 });
  }
}
