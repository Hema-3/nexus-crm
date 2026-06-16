import { toast } from "sonner";
import { useState, useEffect } from "react"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

export function AddTicketModal({ onTicketAdded }: { onTicketAdded: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [customers, setCustomers] = useState<any[]>([])
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "Medium",
        status: "Open",
        customer_id: ""
    })

    useEffect(() => {
        async function getCustomers() {
            try {
                const res = await fetchWithAuth('/api/customers?size=100')
                if (res.ok) {
                    const json = await res.json()
                    setCustomers(json.data || [])
                }
            } catch (e) {
                console.error(e)
            }
        }
        if (open) getCustomers()
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                title: formData.title,
                priority: formData.priority,
                status: formData.status,
                description: formData.description,
                customerId: parseInt(formData.customer_id)
            }
            const res = await fetchWithAuth('/api/tickets', {
                method: 'POST',
                body: JSON.stringify(payload)
            })
            if (!res.ok) throw new Error("Failed to create ticket")
            setOpen(false)
            setFormData({ title: "", description: "", priority: "Medium", status: "Open", customer_id: "" })
            onTicketAdded()
        } catch (error: any) {
            toast.error("Error: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">+ Open Ticket</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Log New Support Issue</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                    <div className="grid gap-2">
                        <Label>Issue Title</Label>
                        <Input
                            placeholder="e.g. Website crashing on login"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Customer</Label>
                        <Select onValueChange={(val) => setFormData({ ...formData, customer_id: val })} required>
                            <SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger>
                            <SelectContent>
                                {customers.map(c => (
                                    <SelectItem key={c.id} value={c.id.toString()}>{c.fullName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Priority</Label>
                            <Select onValueChange={(val) => setFormData({ ...formData, priority: val })} defaultValue="Medium">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select onValueChange={(val) => setFormData({ ...formData, status: val })} defaultValue="Open">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Open">Open</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                    <SelectItem value="Closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Detailed description of the problem..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Ticket"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
