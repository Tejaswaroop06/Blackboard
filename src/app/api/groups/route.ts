import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description, genre, frequency, isStation } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    // Frequency validation
    let finalFrequency: number | null = null;
    if (frequency !== null && frequency !== undefined && frequency !== "") {
      finalFrequency = parseFloat(frequency);
      if (isNaN(finalFrequency) || finalFrequency < 87.5 || finalFrequency > 108.0) {
        return NextResponse.json(
          { error: "Frequency must be between 87.5 and 108.0 MHz" },
          { status: 400 }
        );
      }

      // Check uniqueness via Prisma
      const existing = await prisma.club.findUnique({
        where: { frequency: finalFrequency },
      });

      if (existing) {
        return NextResponse.json(
          { error: "This frequency is already occupied" },
          { status: 400 }
        );
      }
    }

    const creatorId = (session.user as any).id;
    if (!creatorId) {
      return NextResponse.json(
        { error: "Session integrity failure. Please sign in again." },
        { status: 500 }
      );
    }

    // Create the group (maps to Prisma Club model)
    const club = await prisma.club.create({
      data: {
        name,
        description: description || "",
        genre: genre || "GENERAL",
        frequency: finalFrequency,
        isStation: isStation ?? false,
        isLocked: false,
        generation: 1,
      },
    });

    // Create membership for creator
    await prisma.clubMembership.create({
      data: {
        userId: creatorId,
        clubId: club.id,
      },
    });

    return NextResponse.json({ id: club.id, name: club.name }, { status: 201 });
  } catch (error: any) {
    console.error("Group creation error:", error);
    return NextResponse.json(
      {
        error: "Group Initialization Failed",
        message: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Fetch clubs and include the first member in order of creation (the creator)
    const clubs = await prisma.club.findMany({
      include: {
        _count: {
          select: { members: true },
        },
        members: {
          orderBy: { createdAt: "asc" },
          take: 1,
          include: {
            user: {
              select: { pseudonym: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const groups = clubs.map((club) => {
      const creator = club.members[0]?.user?.pseudonym || "Unknown";
      const { members, ...clubData } = club;
      return {
        ...clubData,
        creator,
      };
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Fetch groups error:", error);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}
