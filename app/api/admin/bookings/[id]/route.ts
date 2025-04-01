import { db } from "@/app/_lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"

interface DeleteParams {
  params: {
    id: string
  }
}

export async function DELETE(request: Request, { params: { id } }: DeleteParams) {
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

    const booking = await db.booking.update({
      where: {
        id: id,
      },
      data: {
        status: "CANCELED",
      },
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 