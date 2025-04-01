import { db } from "@/app/_lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const bookings = await db.booking.findMany({
      orderBy: {
        date: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phoneNumber: true,
            image: true,
          },
        },
        service: {
          select: {
            name: true,
            price: true,
          },
        },
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Erro ao buscar histórico de agendamentos:", error)
    return NextResponse.error()
  }
} 