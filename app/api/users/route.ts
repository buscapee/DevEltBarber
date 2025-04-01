import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/app/_lib/prisma"
import { authOptions } from "@/app/_lib/auth"
import { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verifica se o usuário é admin
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

    const users = await db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        phoneNumber: true,
      },
    })

    return NextResponse.json(users)
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
