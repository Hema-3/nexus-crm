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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function EditLeadModal({ lead, isOpen, onClose, onUpdated }: any) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: lead.name,
        value: lead.value,
        status: lead.status,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase
            .from("leads")
            .update({
                name: formData.name,
                value: Number(formData.value),
                status: formData.status,
            })
            .eq("id", lead.id)

        setLoading(false)

        if (error) {
            alert("Error: " + error.message)
        } else {
            onUpdated()
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Deal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Deal Name</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Value ($)</Label>
                        <Input
                            type="number"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Stage</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(val) => setFormData({ ...formData, status: val })}
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
                        {loading ? "Saving..." : "Update Deal"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
