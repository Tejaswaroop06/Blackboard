import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const room = searchParams.get("room");
  const clubId = searchParams.get("clubId");
  const username = (session.user as any).pseudonym;
  const userId = (session.user as any).id;

  if (!room) {
    return NextResponse.json({ error: "Missing room" }, { status: 400 });
  }

  // Ownership check
  let canPublish = false;
  if (clubId) {
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { ownerId: true, isStation: true }
    });
    
    // Only the owner can publish in a Station/Radio
    // For regular clubs, we might allow others, but the requirement is "only me" for radio
    if (club?.ownerId === userId) {
      canPublish = true;
    }
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
  });

  at.addGrant({ 
    roomJoin: true, 
    room: room, 
    canPublish: canPublish, 
    canSubscribe: true 
  });

  return NextResponse.json({ token: await at.toJwt() });
}
