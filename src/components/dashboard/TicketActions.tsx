import { useState } from "react"
import { supabase } from "@/lib/supabase"
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
        await supabase.from('tickets').update({ status: newStatus }).eq('id', ticket.id)
        setLoading(false)
        onUpdated() // Refresh the parent list
    }

    const deleteTicket = async () => {
        if (!confirm("Are you sure you want to delete this ticket?")) return
        setLoading(true)
        await supabase.from('tickets').delete().eq('id', ticket.id)
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
