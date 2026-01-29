import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardTitle } from '@/components/ui/card'
import { AddInvoiceModal } from '@/components/dashboard/AddInvoiceModal'
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight, FileText, Trash, User, Download } from "lucide-react"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const ITEMS_PER_PAGE = 4

export default function Invoices() {
    const [invoices, setInvoices] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)

    async function fetchInvoices() {
        setLoading(true)
        const from = (page - 1) * ITEMS_PER_PAGE
        const to = from + ITEMS_PER_PAGE - 1

        let query = supabase
            .from('invoices')
            .select('*, customers (full_name, email, company)', { count: 'exact' }) // Fetch more customer details
            .order('created_at', { ascending: false })
            .range(from, to)

        if (searchTerm) {
            query = supabase
                .from('invoices')
                .select('*, customers (full_name, email, company)', { count: 'exact' })
                .or(`invoice_number.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%`)
                .range(0, ITEMS_PER_PAGE - 1)
        }

        const { data, count } = await query
        setInvoices(data || [])
        const total = count || 0
        setTotalPages(Math.ceil(total / ITEMS_PER_PAGE) || 1)
        setLoading(false)
    }

    useEffect(() => {
        fetchInvoices()
    }, [page, searchTerm])

    const deleteInvoice = async (id: string) => {
        if (!confirm("Are you sure you want to delete this invoice?")) return
        const { error } = await supabase.from('invoices').delete().eq('id', id)
        if (error) alert(error.message)
        else fetchInvoices()
    }

    // 1. THE NEW PDF GENERATION FUNCTION
    const generatePDF = (invoice: any) => {
        const doc = new jsPDF()

        // Header
        doc.setFontSize(20)
        doc.text("INVOICE", 14, 22)
        doc.setFontSize(10)
        doc.text(`Invoice : ${invoice.invoice_number}`, 14, 30)
        doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 14, 35)
        doc.text(`Due Date: ${invoice.due_date}`, 14, 40)

        // Customer Details
        doc.text("Bill To:", 14, 55)
        doc.setFontSize(12)
        doc.text(invoice.customers?.full_name || "Unknown", 14, 60)
        doc.setFontSize(10)
        doc.text(invoice.customers?.company || "", 14, 65)
        doc.text(invoice.customers?.email || "", 14, 70)

        // Status Badge
        doc.setFillColor(invoice.status === 'Paid' ? 220 : 255, 255, 220) // Light green if paid
        doc.rect(150, 20, 40, 10, 'F')
        doc.setTextColor(0, 0, 0)
        doc.text(invoice.status.toUpperCase(), 155, 26)

        // Table
        autoTable(doc, {
            startY: 80,
            head: [['Description', 'Amount']],
            body: [
                ['Services Rendered', `$${invoice.amount?.toLocaleString()}`], // Placeholder for items
            ],
            foot: [['Total', `$${invoice.amount?.toLocaleString()}`]],
        })

        // Footer
        doc.text("Thank you for your business!", 14, (doc as any).lastAutoTable.finalY + 10)

        // Save
        doc.save(`Invoice_${invoice.invoice_number}.pdf`)
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
                <AddInvoiceModal onInvoiceAdded={() => { setPage(1); fetchInvoices(); }} />
            </div>

            <div className="relative max-w-sm shrink-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="pl-9 bg-white"
                />
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="grid gap-2">
                    {loading ? <p>Loading...</p> : invoices.map((inv) => (
                        <Card key={inv.id} className="flex items-center justify-between p-3 hover:shadow-md transition-shadow">

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                        {inv.invoice_number}
                                        <Badge variant={inv.status === 'Paid' ? 'default' : 'outline'} className="text-[10px] h-5">
                                            {inv.status}
                                        </Badge>
                                    </CardTitle>
                                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                                        <User className="mr-1 h-3 w-3" />
                                        {inv.customers?.full_name || "Unknown Customer"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Due Date</p>
                                    <p className="text-xs font-medium">{inv.due_date}</p>
                                </div>
                                <div className="text-right min-w-[80px]">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Amount</p>
                                    <span className="font-bold text-base">${inv.amount?.toLocaleString()}</span>
                                </div>

                                <div className="flex gap-1">
                                    {/* 2. NEW DOWNLOAD BUTTON */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                        onClick={() => generatePDF(inv)}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => deleteInvoice(inv.id)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {invoices.length === 0 && !loading && <p className="text-muted-foreground py-4">No invoices found.</p>}
                </div>
            </div>

            <div className="flex items-center justify-end space-x-2 py-2 border-t mt-auto shrink-0">
                <span className="text-xs text-muted-foreground mr-4">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" className="h-8" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
                    <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" className="h-8" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}>
                    <ChevronRight className="h-3 w-3" />
                </Button>
            </div>
        </div>
    )
}
