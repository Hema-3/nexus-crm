import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChangePasswordModal } from "@/components/dashboard/ChangePasswordModal"

export default function Settings() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        function getUserData() {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUser({ email: payload.sub, id: 'backend-managed-user' });
                } else {
                    setUser({ email: 'admin@nexuscrm.com', id: '1' });
                }
            } catch (e) {
                setUser({ email: 'admin@nexuscrm.com', id: '1' });
            }
            setLoading(false)
        }
        getUserData()
    }, [])

    if (loading) return <div>Loading profile...</div>

    return (
        <div className="space-y-6 h-full flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            {/* GRID LAYOUT: Two Columns on Medium Screens+ */}
            <div className="grid gap-6 md:grid-cols-2 h-full">

                {/* LEFT COLUMN: Profile Card */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>My Profile</CardTitle>
                        <CardDescription>Manage your account settings and preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="flex items-center space-x-4">
                            <Avatar className="h-20 w-20">
                                <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                                    {user?.email?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-bold">Admin User</h2>
                                <p className="text-gray-500">{user?.email}</p>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mt-1 inline-block">
                                    Authenticated
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>Email Address</Label>
                                <Input value={user?.email} disabled />
                            </div>

                            <div className="grid gap-2">
                                <Label>User ID</Label>
                                <Input value={user?.id} disabled className="font-mono text-xs" />
                            </div>

                            <ChangePasswordModal />
                        </div>

                    </CardContent>
                </Card>

                {/* RIGHT COLUMN: App Info Card */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Application Info</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">App Name</span>
                                <span className="font-medium">Nexus CRM</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Version</span>
                                <span>v1.0.0 (Pro)</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">Framework</span>
                                <span>React + Vite</span>
                            </div>
                            <div className="flex justify-between pt-2">
                                <span className="text-muted-foreground">Database</span>
                                <span className="text-green-600 font-medium">Connected (MySQL)</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
