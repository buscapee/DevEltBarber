import { db } from "@/app/_lib/prisma"
import { NextResponse } from "next/server"

interface DeleteParams {
  params: {
    bookingId: string
  }
}

export async function DELETE(request: Request, { params: { bookingId } }: DeleteParams) {
  try {
    // Ao invés de deletar, vamos atualizar o status para "CANCELED"
    const booking = await db.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: "CANCELED",
      },
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error)
    return NextResponse.error()
  }
} 