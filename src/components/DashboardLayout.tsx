import { useState, useEffect } from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import {
    LayoutDashboard, Users, Target, FileText, CheckSquare,
    Package, Calendar as CalendarIcon, Settings, Menu,
    LifeBuoy, LogOut, X
} from "lucide-react"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const [loading, setLoading] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(false)
    const [user, setUser] = useState<any>(null)

    // Detect Screen Size
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            if (mobile) setIsSidebarOpen(false) // Default closed on mobile
            else setIsSidebarOpen(true) // Default open on desktop
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        const token = localStorage.getItem('nexus_token')
        const email = localStorage.getItem('nexus_user')
        
        if (!token) {
            navigate('/login')
        } else {
            setUser({ email })
            setLoading(false)
        }
    }, [navigate])

    const handleLogout = async () => {
        localStorage.removeItem('nexus_token')
        localStorage.removeItem('nexus_user')
        navigate('/login')
    }

    const navItems = [
        { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
        { name: "Customers", path: "/customers", icon: <Users size={20} /> },
        { name: "Leads", path: "/leads", icon: <Target size={20} /> },
        { name: "Invoices", path: "/invoices", icon: <FileText size={20} /> },
        { name: "Tasks", path: "/tasks", icon: <CheckSquare size={20} /> },
        { name: "Inventory", path: "/products", icon: <Package size={20} /> },
        { name: "Calendar", path: "/calendar", icon: <CalendarIcon size={20} /> },
        { name: "Support", path: "/tickets", icon: <LifeBuoy size={20} /> },
        { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
    ]

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>

    return (
        // ROOT CONTAINER:
        // Mobile: min-h-screen (Allows body scrolling)
        // Desktop: h-screen (Locks height for app-feel)
        <div className="flex w-full bg-slate-50 min-h-screen md:h-screen md:overflow-hidden relative">

            {/* MOBILE OVERLAY */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`
          ${isMobile ? "fixed inset-y-0 left-0 z-50 shadow-2xl h-full" : "relative border-r shrink-0"}
          ${isSidebarOpen ? "w-64" : (isMobile ? "w-0 px-0 border-none" : "w-20")}
          bg-white flex flex-col transition-all duration-300 ease-in-out overflow-hidden
        `}
            >
                <div className={`p-6 flex items-center ${isSidebarOpen ? "justify-between" : "justify-center"}`}>
                    {isSidebarOpen && (
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
                            Nexus CRM
                        </h2>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg text-primary hover:bg-primary/20 transition-colors focus:outline-none"
                    >
                        {isMobile && isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => isMobile && setIsSidebarOpen(false)}
                                className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                  ${isActive
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    }
                  ${!isSidebarOpen && !isMobile && "justify-center"}
                `}
                            >
                                <div className={`${!isSidebarOpen && !isMobile ? "" : "mr-3"} shrink-0`}>
                                    {item.icon}
                                </div>
                                <span className={`whitespace-nowrap font-medium transition-all duration-200 overflow-hidden 
                  ${isSidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0 hidden"}`}>
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* CONTENT WRAPPER */}
            {/* Mobile: Standard block. Desktop: Flex column constrained to screen height */}
            <div className="flex-1 flex flex-col w-full min-w-0 md:min-h-0 md:overflow-hidden">

                {/* HEADER */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-8 shadow-sm shrink-0 z-10 sticky top-0 md:static">
                    <div className="flex items-center gap-3">
                        {isMobile && !isSidebarOpen && (
                            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
                                <Menu size={24} />
                            </button>
                        )}
                        <div className="text-sm text-muted-foreground font-medium hidden sm:block">
                            Welcome back, Admin
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none">
                            <Avatar className="h-9 w-9 hover:ring-2 ring-primary/20 transition-all cursor-pointer">
                                <AvatarImage src={user?.user_metadata?.avatar_url} />
                                <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                                    {user?.email?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-1.5 text-sm">
                                <p className="font-medium truncate">{user?.user_metadata?.full_name || "Admin User"}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                {/* MAIN PAGE CONTENT */}
                {/* Mobile: Grows naturally (overflow-visible). Desktop: Scrolls internally (overflow-y-auto) */}
                <main className="flex-1 p-4 bg-slate-50 overflow-x-hidden md:overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}