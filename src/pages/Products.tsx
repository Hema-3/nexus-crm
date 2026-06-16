import { toast } from "sonner";
import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/api'
import { Card, CardTitle } from '@/components/ui/card'
import { AddProductModal } from '@/components/dashboard/AddProductModal'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight, Package, Tag, Trash } from "lucide-react"

// 1. CHANGED LIMIT TO 4
const ITEMS_PER_PAGE = 4

export default function Products() {
    const [products, setProducts] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)

    async function fetchProducts() {
        setLoading(true)
        try {
            const url = new URL(window.location.origin + '/api/products')
            url.searchParams.append('page', page.toString())
            url.searchParams.append('size', ITEMS_PER_PAGE.toString())
            if (searchTerm) {
                url.searchParams.append('search', searchTerm)
            }

            const res = await fetchWithAuth(url.toString())
            if (!res.ok) throw new Error('Failed to fetch products')
            
            const responseData = await res.json()
            setProducts(responseData.data || [])
            const total = responseData.count || 0
            const calculatedPages = Math.ceil(total / ITEMS_PER_PAGE)
            setTotalPages(calculatedPages > 0 ? calculatedPages : 1)
        } catch (error) {
            console.error("Error fetching products:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [page, searchTerm])

    const deleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return
        try {
            const res = await fetchWithAuth(`/api/products/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete product')
            fetchProducts()
        } catch (error: any) {
            toast.error("Error: " + error.message)
        }
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
                <AddProductModal onProductAdded={() => { setPage(1); fetchProducts(); }} />
            </div>

            {/* 2. NEW PROFESSIONAL SEARCH BAR */}
            <div className="relative max-w-sm shrink-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="pl-9 bg-white"
                />
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="grid gap-2">
                    {loading ? <p>Loading...</p> : products.map((prod) => (
                        <Card key={prod.id} className="flex items-center justify-between p-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-primary/10 rounded-full text-primary">
                                    <Package className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">{prod.name}</CardTitle>
                                    <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                        <Tag className="mr-1 h-3 w-3" />
                                        {prod.sku || "Product"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Stock</p>
                                    <p className="font-mono text-sm font-medium">{prod.stock}</p>
                                </div>
                                <div className="text-right min-w-[80px]">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Price</p>
                                    <span className="font-bold text-base">${prod.price}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => deleteProduct(prod.id)}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                    {products.length === 0 && !loading && <p className="text-muted-foreground py-4">No products found.</p>}
                </div>
            </div>

            <div className="flex items-center justify-end space-x-2 py-2 border-t mt-auto shrink-0">
                <span className="text-xs text-muted-foreground mr-4">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" className="h-8" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
                    <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" className="h-8" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}>
                    <ChevronRight className="h-3 w-3" />
                </Button>
            </div>
        </div>
    )
}
