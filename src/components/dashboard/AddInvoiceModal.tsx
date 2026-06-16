import { useState, useEffect } from "react"
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/api"
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
            try {
                const [custRes, prodRes] = await Promise.all([
                    fetchWithAuth('/api/customers?size=1000'),
                    fetchWithAuth('/api/products?size=1000')
                ])
                const custData = await custRes.json()
                const prodData = await prodRes.json()

                setCustomers(custData.data || [])
                setProducts(prodData.data || [])
            } catch (err) {
                console.error("Failed to load dropdown data:", err)
            }
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

        try {
            const res = await fetchWithAuth('/api/invoices', {
                method: 'POST',
                body: JSON.stringify({
                    invoiceNumber: formData.invoice_number,
                    customerId: formData.customer_id,
                    amount: formData.amount,
                    status: formData.status,
                    dueDate: formData.due_date
                })
            })

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create invoice");
            }

            setLoading(false)
            setOpen(false)
            // Reset form with new random ID
            setFormData({
                invoice_number: `INV-${Math.floor(Math.random() * 100000)}`,
                customer_id: "",
                amount: 0,
                status: "Pending",
                due_date: "",
                selected_product_id: ""
            })
            toast.success("Invoice created successfully!")
            onInvoiceAdded()
        } catch (error: any) {
            setLoading(false)
            toast.error(error.message)
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
                                    <SelectItem key={c.id} value={c.id.toString()}>{c.fullName || c.full_name}</SelectItem>
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
                                    <SelectItem key={p.id} value={p.id.toString()}>
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
