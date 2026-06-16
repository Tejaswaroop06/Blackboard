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
    const userId = (session.user as any).id;

    const memberships = await prisma.clubMembership.findMany({
      where: { userId },
      include: {
        club: {
          include: {
            _count: {
              select: { members: true }
            },
            // Get the latest post for a preview
            posts: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: {
                author: {
                  select: { pseudonym: true }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const groups = memberships.map(m => {
      const club = m.club;
      const lastPost = club.posts[0];
      return {
        id: club.id,
        name: club.name,
        genre: club.genre,
        memberCount: club._count.members,
        lastMessage: lastPost ? {
          content: lastPost.content,
          author: lastPost.author.pseudonym,
          time: lastPost.createdAt
        } : null
      };
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Fetch user groups error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}
