import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch only the Master Broadcast (or any station with a frequency)
    // We filter for the one that is NOT a personal station and has a frequency
    const clubStations = await prisma.club.findMany({
      where: {
        frequency: { not: null },
        isPersonal: false,
      },
      select: {
        id: true,
        name: true,
        frequency: true,
        genre: true,
        isStation: true,
        description: true,
        ownerId: true,
      },
      orderBy: {
        frequency: "asc",
      },
    });

    const stations = clubStations.map((c) => ({
      id: c.id,
      name: c.name,
      frequency: c.frequency as number,
      type: "STATION",
      genre: c.genre,
      description: c.description || "",
      source: "CLUB",
      ownerId: c.ownerId,
    }));

    return NextResponse.json(stations);
  } catch (error) {
    console.error("Fetch stations error:", error);
    return NextResponse.json({ error: "Failed to fetch stations" }, { status: 500 });
  }
}
