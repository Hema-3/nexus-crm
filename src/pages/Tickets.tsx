import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AddTicketModal } from "@/components/dashboard/AddTicketModal"
import { TicketActions } from "@/components/dashboard/TicketActions"
import { Search, AlertCircle, CheckCircle2, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"

import { fetchWithAuth } from '@/lib/api'

const ITEMS_PER_PAGE = 8

export default function Tickets() {
    const [tickets, setTickets] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)

    async function fetchTickets() {
        setLoading(true)

        try {
            const url = new URL(window.location.origin + '/api/tickets')
            url.searchParams.append('page', page.toString())
            url.searchParams.append('size', ITEMS_PER_PAGE.toString())
            if (searchTerm) {
                url.searchParams.append('search', searchTerm)
            }

            const res = await fetchWithAuth(url.toString())
            if (!res.ok) throw new Error('Failed to fetch tickets')
            
            const responseData = await res.json()
            
            setTickets(responseData.data || [])
            const total = responseData.count || 0
            const calculatedPages = Math.ceil(total / ITEMS_PER_PAGE)
            setTotalPages(calculatedPages > 0 ? calculatedPages : 1)
        } catch (error) {
            console.error("Error fetching tickets:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTickets()
    }, [page, searchTerm])

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'Urgent': return 'bg-red-600 hover:bg-red-700 text-white'
            case 'High': return 'bg-orange-500 hover:bg-orange-600 text-white'
            case 'Medium': return 'bg-blue-500 hover:bg-blue-600 text-white'
            default: return 'bg-slate-500 hover:bg-slate-600 text-white'
        }
    }

    return (
        <div className="h-full flex flex-col space-y-3"> {/* Reduced main gap */}
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Help Desk</h1>
                    <p className="text-xs text-muted-foreground">Manage support requests.</p>
                </div>
                <AddTicketModal onTicketAdded={() => { setPage(1); fetchTickets(); }} />
            </div>

            <div className="flex items-center space-x-2 bg-white p-2 rounded-md border shadow-sm max-w-sm shrink-0 h-9">
                <Search className="h-3 w-3 text-muted-foreground ml-2" />
                <Input
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="border-0 focus-visible:ring-0 h-full text-sm"
                />
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
                {/* CHANGED: 'gap-3' to tighten the grid spacing */}
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 h-full grid-rows-2">
                    {loading ? <p>Loading...</p> : tickets.map((ticket) => (
                        <Card key={ticket.id} className="relative hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full rounded-l-lg ${getPriorityColor(ticket.priority).split(' ')[0]}`} />

                            {/* CHANGED: Reduced padding 'p-3' */}
                            <CardHeader className="p-3 pl-4 pb-0">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className={`${getPriorityColor(ticket.priority)} text-[10px] px-1.5 h-5`}>
                                                {ticket.priority}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <TicketActions ticket={ticket} onUpdated={fetchTickets} />
                                </div>

                                <CardTitle className="text-sm font-semibold mt-2 leading-tight pr-2 line-clamp-1">
                                    {ticket.title}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-3 pl-4 pt-1 flex-1 flex flex-col justify-end">
                                {/* CHANGED: line-clamp-1 to save vertical space */}
                                <div className="text-xs text-slate-500 mb-2 line-clamp-1">
                                    {ticket.description || "No description provided."}
                                </div>

                                <div className="flex justify-between items-center border-t pt-2 mt-auto">
                                    <div className="text-xs truncate max-w-[100px]">
                                        <p className="font-medium text-slate-900 truncate">{ticket.customer?.fullName}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{ticket.customer?.company}</p>
                                    </div>

                                    <Badge variant="outline" className="flex items-center gap-1 text-[10px] h-5 px-1.5">
                                        {ticket.status === 'Resolved' ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <AlertCircle className="w-3 h-3" />}
                                        {ticket.status}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Fill empty slots to keep layout stable */}
                    {!loading && Array.from({ length: Math.max(0, ITEMS_PER_PAGE - tickets.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="hidden lg:block border border-dashed border-slate-200 rounded-lg bg-slate-50/50" />
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-end space-x-2 py-2 border-t mt-auto shrink-0">
                <span className="text-xs text-muted-foreground mr-4">
                    Page {page} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Prev
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || loading}
                >
                    Next
                    <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
            </div>
        </div>
    )
}
