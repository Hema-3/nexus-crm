import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AddCustomerModal } from '@/components/dashboard/AddCustomerModal'
import { CustomerActions } from "@/components/dashboard/CustomerActions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

import { fetchWithAuth } from '@/lib/api'

// LOWER THIS NUMBER TO TEST PAGINATION (e.g. 4)
const ITEMS_PER_PAGE = 8

export default function Customers() {
    const [customers, setCustomers] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)

    // Move fetch INSIDE useEffect to prevent "stale state" bugs
    useEffect(() => {
        async function fetchCustomers() {
            setLoading(true)

            try {
                const url = new URL(window.location.origin + '/api/customers')
                url.searchParams.append('page', page.toString())
                url.searchParams.append('size', ITEMS_PER_PAGE.toString())
                if (searchTerm) {
                    url.searchParams.append('search', searchTerm)
                }

                const res = await fetchWithAuth(url.toString())
                if (!res.ok) throw new Error('Failed to fetch customers')
                
                const responseData = await res.json()
                
                setCustomers(responseData.data || [])
                const total = responseData.count || 0
                const calculatedPages = Math.ceil(total / ITEMS_PER_PAGE)
                setTotalPages(calculatedPages > 0 ? calculatedPages : 1)
            } catch (error) {
                console.error("Error fetching customers:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchCustomers()
    }, [page, searchTerm]) // Dependencies ensure this runs when Page changes

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                <AddCustomerModal onCustomerAdded={() => { setPage(1); /* Trigger re-fetch via key or context in real app, or simple reload */ window.location.reload() }} />
            </div>

            <div className="flex items-center space-x-2 bg-white p-2 rounded-md border shadow-sm max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground ml-2" />
                <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setPage(1)
                    }}
                    className="border-0 focus-visible:ring-0"
                />
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {loading ? <p>Loading...</p> : customers.map((customer) => (
                        <Card key={customer.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-sm font-medium">
                                        <Link to={`/customers/${customer.id}`} className="hover:underline hover:text-primary cursor-pointer">
                                            {customer.fullName || customer.full_name}
                                        </Link>
                                    </CardTitle>
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-800 uppercase font-bold">
                                        {customer.status}
                                    </span>
                                </div>
                                <CustomerActions customer={customer} onUpdated={() => window.location.reload()} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-bold truncate">{customer.company}</div>
                                <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4 border-t mt-auto">
                <span className="text-sm text-muted-foreground mr-4">
                    Page {page} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || loading} // Fixed logic
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}