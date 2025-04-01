"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Header from "../_components/header"
import { Button } from "../_components/ui/button"
import { toast } from "sonner"
import { Badge } from "../_components/ui/badge"
import { Calendar, Clock, Mail, Phone, User, Users } from "lucide-react"
import { Card } from "../_components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../_components/ui/table"
import Image from "next/image"

interface Booking {
  id: string
  date: string
  status: string
  user: {
    name: string
    email: string
    phoneNumber: string | null
  }
  service: {
    name: string
    price: number
    barbershop: {
      name: string
      imageUrl: string
    }
  }
}

const AdminPage = () => {
  const { data: sessionData } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [userCount, setUserCount] = useState(0)

  // Função para formatar o número de telefone e gerar o link do WhatsApp
  const getWhatsAppLink = (booking: Booking) => {
    if (!booking.user.phoneNumber) return ""
    // Remove todos os caracteres não numéricos
    const formattedNumber = booking.user.phoneNumber.replace(/\D/g, "")
    // Adiciona o código do país (55 para Brasil) se não existir
    const numberWithCountry = formattedNumber.startsWith("55") ? formattedNumber : `55${formattedNumber}`
    
    // Formata a data e hora
    const data = format(new Date(booking.date), "dd/MM/yyyy", { locale: ptBR })
    const hora = format(new Date(booking.date), "HH:mm")
    const valor = Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(booking.service.price)

    // Cria a mensagem personalizada
    const message = encodeURIComponent(
      `Olá, ${booking.user.name}! Somos da barbearia ${booking.service.barbershop.name}, ` +
      `o seu serviço ${booking.service.name} na data ${data} e horário ${hora} ` +
      `foi confirmado no valor de ${valor}.`
    )
    
    return `https://wa.me/${numberWithCountry}?text=${message}`
  }

  useEffect(() => {
    if (!sessionData?.user) {
      return router.push("/")
    }

    const fetchData = async () => {
      try {
        const [bookingsResponse, usersResponse] = await Promise.all([
          fetch("/api/admin/bookings"),
          fetch("/api/users")
        ])

        if (!bookingsResponse.ok || !usersResponse.ok) {
          throw new Error()
        }

        const bookingsData = await bookingsResponse.json()
        const usersData = await usersResponse.json()

        setBookings(bookingsData)
        setUserCount(usersData.length)
      } catch (error) {
        console.error(error)
        toast.error("Erro ao carregar dados!")
      }
    }

    fetchData()
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
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => router.push("/admin/clients")}
          >
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
              <p className="text-2xl font-bold">{userCount}</p>
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Barbearia</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    <p className="text-sm text-gray-400">Nenhum agendamento encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <Badge variant="secondary">Confirmado</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{booking.user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Mail className="h-4 w-4" />
                          <span>{booking.user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Phone className="h-4 w-4" />
                          <span>{booking.user.phoneNumber || "Não informado"}</span>
                          {booking.user.phoneNumber && (
                            <a
                              href={getWhatsAppLink(booking)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 rounded-full bg-emerald-600 p-1 transition-colors hover:bg-emerald-500"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-white"
                              >
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{booking.service.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{booking.service.barbershop.name}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{format(new Date(booking.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{format(new Date(booking.date), "HH:mm")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-primary">
                        {Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(booking.service.price)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancelar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  )
}

export default AdminPage 