import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AddLeadModal } from "@/components/dashboard/AddLeadModal"
import { LeadActions } from "@/components/dashboard/LeadActions"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_PAGE = 4 // Changed to 4 for testing

export default function Leads() {
    const [leads, setLeads] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)

    async function fetchLeads() {
        setLoading(true)
        const from = (page - 1) * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1

        let query = supabase
            .from('leads')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to)

        if (searchTerm) {
            query = supabase
                .from('leads')
                .select('*', { count: 'exact' })
                .or(`name.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%`)
                .range(0, ITEMS_PER_PAGE - 1)
        }

        const { data, count, error } = await query

        if (!error) {
            setLeads(data || [])
            if (count) setTotalPages(Math.ceil(count / ITEMS_PER_PAGE))
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchLeads()
    }, [page, searchTerm])

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Sales Leads</h1>
                <AddLeadModal onLeadAdded={() => { setPage(1); fetchLeads(); }} />
            </div>

            <div className="flex items-center space-x-2 bg-white p-2 rounded-md border shadow-sm max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground ml-2" />
                <Input
                    placeholder="Search deals..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="border-0 focus-visible:ring-0"
                />
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="grid gap-3">
                    {loading ? <p>Loading...</p> : leads.map((lead) => (
                        <Card key={lead.id} className="flex items-center justify-between p-4">
                            <div className="flex flex-col">
                                <CardTitle className="text-lg">{lead.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">Potential: ${lead.value?.toLocaleString()}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className={`${lead.status === 'Won' ? 'bg-green-100 text-green-800 border-green-200' :
                                    lead.status === 'New' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                        'bg-gray-100 text-gray-800 border-gray-200'
                                    }`}>
                                    {lead.status}
                                </Badge>
                                <LeadActions lead={lead} onUpdated={fetchLeads} />
                            </div>
                        </Card>
                    ))}
                    {leads.length === 0 && !loading && <p className="text-muted-foreground">No leads found.</p>}
                </div>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4 border-t mt-auto">
                <span className="text-sm text-muted-foreground mr-4">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
                    <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}>
                    Next <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}