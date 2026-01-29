import { useState } from "react"
import { supabase } from "@/lib/supabase"
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

        // The SQL Update Logic
        const { error } = await supabase
            .from("customers")
            .update({
                full_name: formData.full_name,
                email: formData.email,
                company: formData.company,
            })
            .eq("id", customer.id) // IMPORTANT: Only update THIS customer

        setLoading(false)

        if (error) {
            alert("Error updating: " + error.message)
        } else {
            onUpdated() // Refresh the background list
            onClose()   // Close the modal
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