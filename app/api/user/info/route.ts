import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/app/_lib/prisma"
import { authOptions } from "@/app/_lib/auth"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }

    const { name, email, phoneNumber } = await request.json()

    if (!name || !email || !phoneNumber) {
      return NextResponse.json(
        { message: "Dados incompletos" },
        { status: 400 }
      )
    }

    // Verifica se o email já está em uso por outro usuário
    const existingUser = await db.user.findFirst({
      where: {
        email,
        NOT: {
          id: session.user.id
        }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Este email já está em uso" },
        { status: 400 }
      )
    }

    const updatedUser = await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name,
        email,
        phoneNumber,
      },
    })

    return NextResponse.json({
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 