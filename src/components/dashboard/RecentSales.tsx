import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function RecentSales({ leads }: { leads: any[] }) {
    const [page, setPage] = useState(1)
    const itemsPerPage = 6

    const totalPages = Math.ceil(leads.length / itemsPerPage)
    const startIndex = (page - 1) * itemsPerPage
    const visibleLeads = leads.slice(startIndex, startIndex + itemsPerPage)

    return (
        // CHANGE: Added 'p-6' (padding) and 'h-full' to fill the parent card
        <div className="flex flex-col h-full p-6 pt-2">

            {/* CHANGE: 'flex-1' makes this section grow to fill all empty space */}
            <div className="flex-1 space-y-4">
                {visibleLeads.length === 0 && <p className="text-sm text-muted-foreground">No recent activity.</p>}

                {visibleLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {lead.name ? lead.name.substring(0, 2).toUpperCase() : "??"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none truncate w-[140px]">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {lead.status}
                            </p>
                        </div>
                        <div className="ml-auto font-medium text-sm">
                            +${lead.value?.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            {/* CHANGE: This footer will now sit at the very bottom edge */}
            <div className="flex items-center justify-between pt-4 border-t mt-4">
                <span className="text-xs text-muted-foreground">
                    Page {page} of {totalPages || 1}
                </span>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || totalPages === 0}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
