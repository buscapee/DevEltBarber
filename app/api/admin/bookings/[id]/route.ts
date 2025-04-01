import { db } from "@/app/_lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

interface RouteParams {
  params: {
    id: string
  }
}

// Rota para confirmar agendamento
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      )
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso restrito a administradores" },
        { status: 403 },
      )
    }

    const { status } = await request.json()

    const booking = await db.booking.update({
      where: {
        id: params.id,
      },
      data: {
        status: status,
      },
      include: {
        service: {
          include: {
            barbershop: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            phoneNumber: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Erro detalhado:", error)

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: "Erro de conexão com o banco de dados" },
        { status: 500 },
      )
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `Erro do Prisma: ${error.code} - ${error.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Rota para cancelar agendamento
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      )
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso restrito a administradores" },
        { status: 403 },
      )
    }

    const booking = await db.booking.update({
      where: {
        id: params.id,
      },
      data: {
        status: "CANCELED",
      },
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Erro detalhado:", error)

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { error: "Erro de conexão com o banco de dados" },
        { status: 500 },
      )
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `Erro do Prisma: ${error.code} - ${error.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
