import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, FileText, DollarSign } from "lucide-react"

export default function CustomerDetails() {
    const { id } = useParams() // Get the ID from the URL
    const navigate = useNavigate()
    const [customer, setCustomer] = useState<any>(null)
    const [notes, setNotes] = useState<any[]>([])
    const [newNote, setNewNote] = useState("")
    const [totalSpent, setTotalSpent] = useState(0)
    const [loading, setLoading] = useState(true)

    async function fetchData() {
        if (!id) return

        // 1. Get Customer Details
        const { data: cust } = await supabase.from('customers').select('*').eq('id', id).single()
        setCustomer(cust)

        // 2. Get Notes
        const { data: noteData } = await supabase
            .from('notes')
            .select('*')
            .eq('customer_id', id)
            .order('created_at', { ascending: false })
        setNotes(noteData || [])

        // 3. Calculate Total Revenue from Invoices
        const { data: invoices } = await supabase.from('invoices').select('amount').eq('customer_id', id)
        const total = invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0
        setTotalSpent(total)

        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [id])

    const addNote = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newNote.trim()) return

        await supabase.from('notes').insert([{ content: newNote, customer_id: id }])
        setNewNote("")
        fetchData() // Refresh list
    }

    if (loading) return <div className="p-8">Loading customer profile...</div>

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/customers')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{customer.full_name}</h1>
                    <p className="text-muted-foreground">{customer.company} • {customer.email}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* LEFT COLUMN: Stats & Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Lifetime Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center">
                                <DollarSign className="h-5 w-5 mr-1 text-green-600" />
                                {totalSpent.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Contact Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Status</span>
                                <span className="capitalize font-medium">{customer.status}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Joined</span>
                                <span>{new Date(customer.created_at).toLocaleDateString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Activity Stream (Notes) */}
                <div className="md:col-span-2">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" /> Activity & Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-4">
                            {/* Note Input */}
                            <form onSubmit={addNote} className="flex gap-2">
                                <Input
                                    placeholder="Log a call, meeting, or thought..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                />
                                <Button type="submit">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>

                            {/* Notes List */}
                            <div className="space-y-4 mt-4 max-h-[400px] overflow-y-auto pr-2">
                                {notes.map((note) => (
                                    <div key={note.id} className="bg-slate-50 p-4 rounded-lg border">
                                        <p className="text-sm text-gray-800">{note.content}</p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {new Date(note.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                                {notes.length === 0 && <p className="text-muted-foreground text-center py-8">No notes yet.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
