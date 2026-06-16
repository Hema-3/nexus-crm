import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from 'sonner'
import Dashboard from "@/pages/Dashboard"
import Customers from "@/pages/Customers"
import Login from "@/pages/Login"
import Leads from "@/pages/Leads"
import Settings from "@/pages/Settings"
import Invoices from "@/pages/Invoices"
import CustomerDetails from "@/pages/CustomerDetails"
import Tasks from "@/pages/Tasks"
import Tickets from "@/pages/Tickets"
import Products from "@/pages/Products"
import CalendarView from "@/pages/CalendarView"
import DashboardLayout from "@/components/DashboardLayout"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTE: The Login page stands alone (No Sidebar) */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ROUTES: These are wrapped in the Layout (Has Sidebar + Security) */}
        <Route element={<DashboardLayout />}>
          <Route path="/leads" element={<Leads />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/products" element={<Products />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  )
}

export default App