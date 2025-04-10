"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Header from "../_components/header"
import { Button } from "../_components/ui/button"
import { toast } from "sonner"
import { Badge } from "../_components/ui/badge"
import {
  Calendar,
  Clock,
  Mail,
  MessageCircle,
  Phone,
  User,
  Users,
  History,
  Loader2,
} from "lucide-react"
import { Card } from "../_components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../_components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "../_components/ui/avatar"
import Link from "next/link"

interface BookingWithDetails {
  id: string
  date: string
  status: "PENDING" | "CONFIRMED" | "CANCELED" | "COMPLETED"
  user: {
    name: string
    email: string
    phoneNumber: string | null
    image: string | null
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
  const { data: sessionData, status: sessionStatus } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [userCount, setUserCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Função para formatar o número de telefone e gerar o link do WhatsApp
  const getWhatsAppLink = (booking: BookingWithDetails) => {
    if (!booking.user.phoneNumber) return ""
    // Remove todos os caracteres não numéricos
    const formattedNumber = booking.user.phoneNumber.replace(/\D/g, "")
    // Adiciona o código do país (55 para Brasil) se não existir
    const numberWithCountry = formattedNumber.startsWith("55")
      ? formattedNumber
      : `55${formattedNumber}`

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
        `foi confirmado no valor de ${valor}.`,
    )

    return `https://wa.me/${numberWithCountry}?text=${message}`
  }

  useEffect(() => {
    if (sessionStatus === "loading") return

    if (!sessionData?.user) {
      router.push("/")
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Busca os agendamentos
        const bookingsResponse = await fetch("/api/admin/bookings", {
          cache: "no-store",
        })

        if (!bookingsResponse.ok) {
          const errorText = await bookingsResponse.text()
          throw new Error(`Erro ao buscar agendamentos: ${errorText}`)
        }

        const bookingsData = await bookingsResponse.json()
        setBookings(bookingsData)

        // Busca os usuários
        const usersResponse = await fetch("/api/users", {
          cache: "no-store",
        })

        if (!usersResponse.ok) {
          const errorText = await usersResponse.text()
          throw new Error(`Erro ao buscar usuários: ${errorText}`)
        }

        const usersData = await usersResponse.json()
        setUserCount(usersData.length)
      } catch (error) {
        console.error("Erro detalhado:", error)
        toast.error(
          error instanceof Error ? error.message : "Erro ao carregar dados!",
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, sessionData?.user, sessionStatus])

  const handleCancelBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }

      // Remove o agendamento da lista ou atualiza seu status
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === id ? { ...booking, status: "CANCELED" } : booking,
        ),
      )
      toast.success("Agendamento cancelado com sucesso!")
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error)
      toast.error("Erro ao cancelar agendamento!")
    }
  }

  const handleUpdateStatus = async (
    id: string,
    status: "PENDING" | "CONFIRMED" | "CANCELED" | "COMPLETED",
  ) => {
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }

      // Atualiza o status do agendamento na lista
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === id ? { ...booking, status } : booking,
        ),
      )
      toast.success(`Status atualizado para ${status}`)
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      toast.error("Erro ao atualizar status!")
    }
  }

  // Filtra apenas os agendamentos ativos (não cancelados) para a lista principal
  const activeBookings = bookings.filter(
    (booking) => booking.status !== "CANCELED",
  )

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex h-[calc(100vh-80px)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="space-y-5 p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Painel Administrativo</h1>
          <div className="flex gap-2">
            <Button asChild variant="secondary">
              <Link href="/admin/clients">
                <Users className="mr-2 h-4 w-4" />
                Clientes
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/admin/history">
                <History className="mr-2 h-4 w-4" />
                Histórico
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="flex items-center gap-3 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Agendamentos</p>
              <p className="text-2xl font-bold">{activeBookings.length}</p>
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
              <p className="text-sm text-gray-400">
                Gerencie os agendamentos da barbearia
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <p className="text-sm text-gray-400">
                      Nenhum agendamento encontrado
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                activeBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <Badge
                        variant={
                          booking.status === "COMPLETED"
                            ? "default"
                            : booking.status === "CANCELED"
                              ? "destructive"
                              : booking.status === "CONFIRMED"
                                ? "secondary"
                                : "outline"
                        }
                      >
                        {booking.status === "COMPLETED"
                          ? "Finalizado"
                          : booking.status === "CANCELED"
                            ? "Cancelado"
                            : booking.status === "CONFIRMED"
                              ? "Confirmado"
                              : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            {booking.user.image ? (
                              <AvatarImage
                                src={booking.user.image}
                                alt={booking.user.name}
                                className="transition-transform hover:absolute hover:z-50 hover:scale-[3]"
                              />
                            ) : (
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {booking.user.name}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Mail className="h-3 w-3" />
                            <span>{booking.user.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Phone className="h-3 w-3" />
                            <span>
                              {booking.user.phoneNumber || "Não informado"}
                            </span>
                            {booking.user.phoneNumber && (
                              <a
                                href={getWhatsAppLink(booking)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full bg-emerald-600 p-1 transition-colors hover:bg-emerald-500"
                              >
                                <MessageCircle className="h-3 w-3 text-white" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {booking.service.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {format(new Date(booking.date), "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{format(new Date(booking.date), "HH:mm")}</span>
                        </div>
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
                      <div className="flex gap-2">
                        {booking.status === "PENDING" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(booking.id, "CONFIRMED")
                            }
                          >
                            Confirmar
                          </Button>
                        )}
                        {booking.status === "CONFIRMED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(booking.id, "COMPLETED")
                            }
                          >
                            Finalizar
                          </Button>
                        )}
                        {(booking.status === "PENDING" ||
                          booking.status === "CONFIRMED") && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
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
