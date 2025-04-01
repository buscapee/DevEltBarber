"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { Booking, Barbershop } from "@prisma/client"

type ConfirmedBooking = Booking & {
  service: {
    barbershop: Barbershop;
  };
}

export const getConfirmedBookings = async (): Promise<ConfirmedBooking[]> => {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return []
  }
  return db.booking.findMany({
    where: {
      userId: (session.user as any).id,
      date: {
        gte: new Date(),
      },
    },
    include: {
      service: {
        include: {
          barbershop: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  }) as Promise<ConfirmedBooking[]>
}
