import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: postId } = await params;

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        resonance: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ resonance: post.resonance });
  } catch (error) {
    console.error("Resonance error:", error);
    return NextResponse.json(
      { error: "Failed to resonate" },
      { status: 500 }
    );
  }
}
