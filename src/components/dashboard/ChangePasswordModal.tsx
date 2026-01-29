import { useState } from "react"
import { supabase } from "@/lib/supabase"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ChangePasswordModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [passwords, setPasswords] = useState({ new: "", confirm: "" })
    const [error, setError] = useState("")

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // 1. Basic Validation
        if (passwords.new.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }
        if (passwords.new !== passwords.confirm) {
            setError("Passwords do not match")
            return
        }

        setLoading(true)

        // 2. Call Supabase API
        const { error } = await supabase.auth.updateUser({
            password: passwords.new
        })

        if (error) {
            setError(error.message)
        } else {
            setOpen(false)
            setPasswords({ new: "", confirm: "" })
            alert("Success! Your password has been updated.")
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-fit">Change Password</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                        Enter a new password for your account.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            placeholder="••••••"
                            value={passwords.new}
                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            placeholder="••••••"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                            required
                        />
                    </div>

                    {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                    <Button type="submit" disabled={loading}>
                        {loading ? "Updating..." : "Update Password"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
