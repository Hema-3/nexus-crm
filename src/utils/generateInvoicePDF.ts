import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export const generateInvoicePDF = (invoice: any) => {
    const doc = new jsPDF()

    // 1. Company Header
    doc.setFontSize(20)
    doc.text("Nexus CRM", 14, 22)
    doc.setFontSize(10)
    doc.text("123 Business Rd, Tech City", 14, 28)
    doc.text("support@nexuscrm.com", 14, 33)

    // 2. Invoice Title & Details
    doc.setFontSize(16)
    doc.text("INVOICE", 140, 22)

    doc.setFontSize(10)
    doc.text(`Invoice : ${invoice.invoice_number}`, 140, 28)
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 140, 33)
    doc.text(`Due Date: ${invoice.due_date}`, 140, 38)

    // 3. Status Badge Logic
    doc.setFillColor(invoice.status === 'Paid' ? 220 : 255, invoice.status === 'Paid' ? 255 : 220, 220)
    doc.rect(140, 42, 30, 8, 'F')
    doc.text(`Status: ${invoice.status}`, 142, 47)

    // 4. Customer Details (Bill To)
    doc.text("Bill To:", 14, 55)
    doc.setFontSize(12)
    doc.text(invoice.customers?.full_name || "Unknown Customer", 14, 62)
    doc.setFontSize(10)
    doc.text(invoice.customers?.company || "", 14, 67)
    doc.text(invoice.customers?.email || "", 14, 72)

    // 5. Line Items Table (Simulated)
    // Since we don't have line items in DB yet, we simulate the main service
    autoTable(doc, {
        startY: 85,
        head: [['Description', 'Category', 'Price']],
        body: [
            ['Consulting Services / Product Purchase', 'Service', `$${invoice.amount}`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] } // Dark slate color
    })

    // 6. Total Amount
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(14)
    doc.text(`Total: $${invoice.amount}`, 140, finalY)

    // 7. Footer
    doc.setFontSize(8)
    doc.text("Thank you for your business!", 14, 280)

    // 8. Save
    doc.save(`Invoice-${invoice.invoice_number}.pdf`)
}
