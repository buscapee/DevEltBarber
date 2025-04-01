"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"

export const deleteBooking = async (id: string) => {
  await db.booking.delete({
    where: {
      id: id,
    },
  })
  revalidatePath("/bookings")
}
