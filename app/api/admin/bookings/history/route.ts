import { db } from "@/app/_lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { Prisma } from "@prisma/client"

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
    console.error("Erro detalhado:", error)
    
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: "Erro de conexão com o banco de dados" },
        { status: 500 }
      )
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `Erro do Prisma: ${error.code} - ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Erro interno do servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 