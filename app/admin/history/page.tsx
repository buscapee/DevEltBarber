"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table"
import { Input } from "@/app/_components/ui/input"
import { Search, User, Calendar, Clock } from "lucide-react"
import Header from "@/app/_components/header"
import { Badge } from "@/app/_components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Booking {
  id: string
  date: string
  status: string
  user: {
    name: string
    email: string
    phoneNumber: string | null
    image: string | null
  }
  service: {
    name: string
    price: number
  }
}

export default function HistoryPage() {
  const [search, setSearch] = useState("")
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/admin/bookings/history")
        if (!response.ok) {
          throw new Error("Erro ao carregar histórico")
        }
        const data = await response.json()
        setBookings(data)
      } catch (error) {
        console.error("Erro ao carregar histórico:", error)
      }
    }

    fetchBookings()
  }, [])

  const filteredBookings = bookings.filter((booking) =>
    booking.user.name.toLowerCase().includes(search.toLowerCase()) ||
    booking.user.email.toLowerCase().includes(search.toLowerCase()) ||
    booking.service.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Header />
      <div className="container mx-auto space-y-4 p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <CardTitle className="text-2xl font-bold">Histórico de Agendamentos</CardTitle>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Buscar por nome, email ou serviço..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8"
              />
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Preço</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        <p className="text-sm text-gray-400">Nenhum agendamento encontrado</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <Badge 
                            variant={
                              booking.status === "COMPLETED" 
                                ? "secondary"
                                : booking.status === "CANCELED"
                                ? "destructive"
                                : "default"
                            }
                          >
                            {booking.status === "COMPLETED" 
                              ? "Finalizado" 
                              : booking.status === "CANCELED"
                              ? "Cancelado"
                              : "Confirmado"
                            }
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-8 w-8">
                                {booking.user.image ? (
                                  <AvatarImage src={booking.user.image} alt={booking.user.name} />
                                ) : (
                                  <AvatarFallback>
                                    <User className="h-4 w-4" />
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{booking.user.name}</span>
                              <span className="text-xs text-gray-400">{booking.user.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{booking.service.name}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{format(new Date(booking.date), "dd/MM/yyyy", { locale: ptBR })}</span>
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
} 