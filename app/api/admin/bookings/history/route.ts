import { db } from "@/app/_lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

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
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 