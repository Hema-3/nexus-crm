import { useState, useEffect } from "react"
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

export function AddInvoiceModal({ onInvoiceAdded }: { onInvoiceAdded: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Data State
    const [customers, setCustomers] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])

    // Form State
    const [formData, setFormData] = useState({
        invoice_number: `INV-${Math.floor(Math.random() * 10000)}`, // Auto-generate ID
        customer_id: "",
        amount: 0,
        status: "Pending",
        due_date: "",
        // We add a 'selected_product' to help with logic, though we only save 'amount' to DB for now
        selected_product_id: ""
    })

    // Fetch Customers & Products when modal opens
    useEffect(() => {
        async function fetchData() {
            const { data: custData } = await supabase.from('customers').select('id, full_name')
            const { data: prodData } = await supabase.from('products').select('id, name, price')

            setCustomers(custData || [])
            setProducts(prodData || [])
        }
        if (open) fetchData()
    }, [open])

    // Handle Product Selection (The "Smart" Logic)
    const handleProductSelect = (productId: string) => {
        const product = products.find(p => p.id === productId)
        if (product) {
            setFormData({
                ...formData,
                selected_product_id: productId,
                amount: product.price // <--- AUTO-FILL PRICE
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.from("invoices").insert([{
            invoice_number: formData.invoice_number,
            customer_id: formData.customer_id,
            amount: formData.amount,
            status: formData.status,
            due_date: formData.due_date
        }])

        setLoading(false)

        if (error) {
            alert("Error: " + error.message)
        } else {
            setOpen(false)
            // Reset form with new random ID
            setFormData({
                invoice_number: `INV-${Math.floor(Math.random() * 10000)}`,
                customer_id: "",
                amount: 0,
                status: "Pending",
                due_date: "",
                selected_product_id: ""
            })
            onInvoiceAdded()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>+ Create Invoice</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                    <div className="grid gap-2">
                        <Label>Invoice Number</Label>
                        <Input
                            value={formData.invoice_number}
                            onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Customer</Label>
                        <Select onValueChange={(val) => setFormData({ ...formData, customer_id: val })} required>
                            <SelectTrigger><SelectValue placeholder="Select Customer" /></SelectTrigger>
                            <SelectContent>
                                {customers.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* THE NEW SMART FIELD */}
                    <div className="grid gap-2">
                        <Label>Select Product (Auto-fills Amount)</Label>
                        <Select onValueChange={handleProductSelect}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose from Inventory..." />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name} (${p.price})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Total Amount ($)</Label>
                        <Input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Due Date</Label>
                        <Input
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select onValueChange={(val) => setFormData({ ...formData, status: val })} defaultValue="Pending">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Overdue">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Invoice"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
