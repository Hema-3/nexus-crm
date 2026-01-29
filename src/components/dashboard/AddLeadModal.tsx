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
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function AddLeadModal({ onLeadAdded }: { onLeadAdded: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        value: "",
        status: "New",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.from("leads").insert([
            {
                name: formData.name,
                value: Number(formData.value), // Convert string to number for DB
                status: formData.status,
            },
        ])

        setLoading(false)

        if (error) {
            alert("Error adding lead: " + error.message)
        } else {
            setOpen(false)
            setFormData({ name: "", value: "", status: "New" }) // Reset form
            onLeadAdded()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>+ Add Deal</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Sales Deal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Deal Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Website Redesign for Nike"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="value">Potential Value ($)</Label>
                        <Input
                            id="value"
                            type="number"
                            placeholder="5000"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">Stage</Label>
                        <Select
                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                            defaultValue={formData.status}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="New">New Lead</SelectItem>
                                <SelectItem value="Contacted">Contacted</SelectItem>
                                <SelectItem value="Proposal">Proposal Sent</SelectItem>
                                <SelectItem value="Won">Closed Won</SelectItem>
                                <SelectItem value="Lost">Closed Lost</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Create Deal"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}