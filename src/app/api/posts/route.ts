import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, genre, clubId } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    // Security check: if posting to a club, verify membership
    if (genre === "CLUB" && clubId) {
      const membership = await prisma.clubMembership.findUnique({
        where: {
          userId_clubId: {
            userId: (session.user as any).id,
            clubId: clubId,
          },
        },
      });

      if (!membership) {
        return NextResponse.json({ error: "Not a member of this club" }, { status: 403 });
      }
    }

    const post = await prisma.post.create({
      data: {
        content,
        genre: genre || "FEED",
        clubId: genre === "CLUB" ? clubId : null,
        authorId: (session.user as any).id,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Post error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const genre = searchParams.get("genre");
  const clubId = searchParams.get("clubId");

  const whereClause: any = {};
  if (genre) whereClause.genre = genre;
  if (clubId) whereClause.clubId = clubId;

  try {
    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            pseudonym: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Fetch posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
