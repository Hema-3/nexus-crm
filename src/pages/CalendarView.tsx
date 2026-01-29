import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function CalendarView() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [events, setEvents] = useState<any[]>([])
    const [selectedDayEvents, setSelectedDayEvents] = useState<any[]>([])

    // Pagination State
    const [page, setPage] = useState(1)
    const itemsPerPage = 4

    useEffect(() => {
        async function fetchAllEvents() {
            const { data: tasks } = await supabase.from('tasks').select('id, title, due_date, is_completed')
            const { data: invoices } = await supabase.from('invoices').select('id, invoice_number, due_date, status, amount')

            const taskEvents = (tasks || []).map(t => ({
                id: t.id,
                title: `Task: ${t.title}`,
                date: t.due_date,
                type: 'task',
                status: t.is_completed ? 'Done' : 'Pending'
            }))

            const invoiceEvents = (invoices || []).map(i => ({
                id: i.id,
                title: `Invoice ${i.invoice_number} ($${i.amount})`,
                date: i.due_date,
                type: 'invoice',
                status: i.status
            }))

            setEvents([...taskEvents, ...invoiceEvents])
        }
        fetchAllEvents()
    }, [])

    useEffect(() => {
        if (date) {
            const dateString = format(date, 'yyyy-MM-dd')
            const matches = events.filter(e => e.date === dateString)
            setSelectedDayEvents(matches)
            setPage(1) // Reset to page 1 when clicking a new date
        }
    }, [date, events])

    // Pagination Logic
    const totalPages = Math.ceil(selectedDayEvents.length / itemsPerPage)
    const startIndex = (page - 1) * itemsPerPage
    const visibleEvents = selectedDayEvents.slice(startIndex, startIndex + itemsPerPage)

    return (
        <div className="flex flex-col h-full space-y-4">
            <h1 className="text-2xl font-bold tracking-tight shrink-0">Calendar</h1>

            <div className="grid md:grid-cols-[300px_1fr] gap-8 h-full min-h-0">
                <Card className="h-fit shrink-0">
                    <CardContent className="p-4">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border shadow"
                            modifiers={{
                                hasEvent: (d) => events.some(e => e.date === format(d, 'yyyy-MM-dd'))
                            }}
                            modifiersStyles={{
                                hasEvent: { fontWeight: 'bold', textDecoration: 'underline', color: 'var(--primary)' }
                            }}
                        />
                    </CardContent>
                </Card>

                {/* RIGHT COLUMN: Paginated Events List */}
                <Card className="flex flex-col h-full min-h-0">
                    <CardHeader className="shrink-0">
                        <CardTitle>
                            Schedule for {date ? format(date, 'MMMM do, yyyy') : 'Selected Date'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0">
                        <div className="space-y-3 flex-1 overflow-auto">
                            {visibleEvents.length === 0 ? (
                                <p className="text-muted-foreground py-10 text-center">No events scheduled for this day.</p>
                            ) : (
                                visibleEvents.map((event) => (
                                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                                        <div>
                                            <p className="font-medium text-sm">{event.title}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase mt-1">{event.type}</p>
                                        </div>
                                        <Badge variant={event.type === 'invoice' ? 'default' : 'secondary'}>
                                            {event.status}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {selectedDayEvents.length > 0 && (
                            <div className="flex items-center justify-end space-x-2 py-2 border-t mt-auto shrink-0">
                                <span className="text-xs text-muted-foreground mr-4">Page {page} of {totalPages}</span>
                                <Button variant="outline" size="sm" className="h-8" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                                    <ChevronLeft className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm" className="h-8" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                                    <ChevronRight className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
