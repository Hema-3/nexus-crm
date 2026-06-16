import { useState } from "react"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, CheckCircle, Trash, PlayCircle } from "lucide-react"

export function TicketActions({ ticket, onUpdated }: { ticket: any, onUpdated: () => void }) {
    const [loading, setLoading] = useState(false)

    const updateStatus = async (newStatus: string) => {
        setLoading(true)
        try {
            const ticketData = { ...ticket, status: newStatus }
            delete ticketData.customers // Remove joined data before sending
            await fetchWithAuth(`/api/tickets/${ticket.id}`, {
                method: 'PUT',
                body: JSON.stringify(ticketData)
            })
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
        onUpdated() // Refresh the parent list
    }

    const deleteTicket = async () => {
        if (!confirm("Are you sure you want to delete this ticket?")) return
        setLoading(true)
        try {
            await fetchWithAuth(`/api/tickets/${ticket.id}`, { method: 'DELETE' })
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
        onUpdated()
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                {/* Status Actions */}
                <DropdownMenuItem onClick={() => updateStatus('In Progress')}>
                    <PlayCircle className="mr-2 h-4 w-4 text-blue-500" />
                    Mark In Progress
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => updateStatus('Resolved')}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Mark Resolved
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => updateStatus('Closed')}>
                    <CheckCircle className="mr-2 h-4 w-4 text-slate-500" />
                    Mark Closed
                </DropdownMenuItem>

                {/* Destructive Action */}
                <DropdownMenuItem onClick={deleteTicket} className="text-red-600">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Ticket
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
