import { useEffect, useState } from "react"
import { fetchWithAuth } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/Overview"
import { RecentSales } from "@/components/dashboard/RecentSales"
import { DollarSign, Users, Activity } from "lucide-react"

export default function Dashboard() {
    const [stats, setStats] = useState({ totalCustomers: 0, totalRevenue: 0, activeLeads: 0 })
    const [recentLeads, setRecentLeads] = useState<any[]>([])

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const res = await fetchWithAuth('/api/dashboard/stats')
                if (res.ok) {
                    const data = await res.json()
                    setStats({
                        totalCustomers: data.totalCustomers || 0,
                        totalRevenue: data.totalRevenue || 0,
                        activeLeads: data.activeLeads || 0
                    })
                    setRecentLeads(data.recentLeads || [])
                }
            } catch (err) {
                console.error("Failed to connect to Java backend.", err)
            }
        }
        fetchDashboardData()
    }, [])

    return (
        // RESPONSIVE CONTAINER:
        // Mobile: h-auto (scrolls), Desktop: h-full (no scroll)
        <div className="flex flex-col h-auto md:h-full space-y-4">

            {/* STATS ROW: 1 Col on Mobile, 3 Cols on Desktop */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3 shrink-0">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeLeads}</div>
                    </CardContent>
                </Card>
            </div>

            {/* BOTTOM SECTION: Stacks on mobile, Grid on Desktop */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7 flex-1 min-h-0">

                {/* CHART: Fixed height on mobile (350px), Full height on desktop */}
                <Card className="col-span-1 lg:col-span-4 flex flex-col min-h-[350px] lg:min-h-0 lg:h-full">
                    <CardHeader className="pb-2">
                        <CardTitle>Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2 flex-1 min-h-0">
                        <div className="h-full w-full min-h-[300px] lg:min-h-0">
                            <Overview />
                        </div>
                    </CardContent>
                </Card>

                {/* RECENT DEALS */}
                <Card className="col-span-1 lg:col-span-3 flex flex-col min-h-[400px] lg:min-h-0 lg:h-full">
                    <CardHeader className="pb-2">
                        <CardTitle>Recent Deals</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden min-h-0">
                        <RecentSales leads={recentLeads} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}