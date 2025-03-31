"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Header from "../_components/header"
import { Button } from "../_components/ui/button"
import { toast } from "sonner"
import { Badge } from "../_components/ui/badge"
import { Calendar, Clock, User, Users } from "lucide-react"
import { Card } from "../_components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Booking {
  id: string
  date: string
  status: string
  user: {
    name: string
    email: string
  }
  service: {
    name: string
    price: number
    barbershop: {
      name: string
    }
  }
}

const AdminPage = () => {
  const { data: sessionData } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    if (!sessionData?.user) {
      return router.push("/")
    }

    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/admin/bookings")
        if (!response.ok) {
          throw new Error()
        }
        const data = await response.json()
        setBookings(data)
      } catch (error) {
        console.error(error)
        toast.error("Erro ao carregar agendamentos!")
      }
    }

    fetchBookings()
  }, [])

  const handleCancelBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error()
      }
      // Atualiza a lista de agendamentos removendo o item cancelado
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking.id !== id),
      )
      toast.success("Reserva cancelada com sucesso!")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao cancelar reserva!")
    }
  }

  return (
    <>
      <Header />
      <div className="space-y-5 p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Painel Administrativo</h1>
          <Button variant="outline" size="sm" className="gap-2">
            <Users className="h-4 w-4" />
            Clientes
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="flex items-center gap-3 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Agendamentos</p>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Clientes</p>
              <p className="text-2xl font-bold">2</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Hoje</p>
              <p className="text-2xl font-bold">5</p>
            </div>
          </Card>
        </div>

        <Card className="space-y-5 p-5">
          <div className="flex items-center justify-between border-b border-gray-800 pb-5">
            <div className="space-y-1">
              <h2 className="text-lg font-bold">Agendamentos</h2>
              <p className="text-sm text-gray-400">Gerencie os agendamentos da barbearia</p>
            </div>
          </div>

          <div className="space-y-3">
            {bookings.length === 0 ? (
              <p className="text-center text-sm text-gray-400">Nenhum agendamento encontrado</p>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-5"
                >
                  <div className="space-y-2">
                    <Badge variant="secondary">Confirmado</Badge>
                    <h3 className="font-medium">{booking.service.barbershop.name}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <User className="h-4 w-4" />
                        <p>{booking.user.name}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <p>{format(new Date(booking.date), "dd 'de' MMMM", { locale: ptBR })}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        <p>{format(new Date(booking.date), "HH:mm")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-2">
                    <p className="text-sm font-medium text-primary">
                      {Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(booking.service.price)}
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </>
  )
}

export default AdminPage 