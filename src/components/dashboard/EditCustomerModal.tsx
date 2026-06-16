import { toast } from "sonner";
import { useState } from "react"
import { fetchWithAuth } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

// We define what a Customer looks like so TypeScript is happy
interface Customer {
    id: string
    full_name: string
    email: string
    company: string
}

interface EditCustomerModalProps {
    customer: Customer
    isOpen: boolean
    onClose: () => void
    onUpdated: () => void
}

export function EditCustomerModal({ customer, isOpen, onClose, onUpdated }: EditCustomerModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        full_name: customer.full_name,
        email: customer.email,
        company: customer.company,
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // The SQL Update Logic via Java Backend
        try {
            const res = await fetchWithAuth(`/api/customers/${customer.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    fullName: formData.full_name,
                    email: formData.email,
                    company: formData.company,
                    status: "Active" // Keep existing status if we had it, but hardcode for now
                })
            })
            
            if (!res.ok) throw new Error('Failed to update customer')
            
            setLoading(false)
            onUpdated() // Refresh the background list
            onClose()   // Close the modal
        } catch (error: any) {
            setLoading(false)
            toast.error("Error updating: " + error.message)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Customer</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="full_name" value={formData.full_name} onChange={handleChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" name="company" value={formData.company} onChange={handleChange} required />
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}