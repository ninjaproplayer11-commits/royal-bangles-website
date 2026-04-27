import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoice = (order: any) => {
  try {
    const doc = new jsPDF();

    // Header Colors
    const gold: [number, number, number] = [212, 175, 55];
    const black: [number, number, number] = [10, 10, 10];

    // Title Section
    doc.setFillColor(...black);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(...gold);
    doc.setFontSize(28);
    doc.setFont('times', 'bold');
    doc.text('ROYAL BANGLES', 105, 25, { align: 'center' });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('EXQUISITE HANDCRAFTED JEWELRY', 105, 32, { align: 'center' });

    // Order Info Section
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE TO:', 20, 55);
    
    doc.setFont('helvetica', 'normal');
    const addr = order.address || {};
    doc.text(addr.name || 'Valued Customer', 20, 62);
    doc.text(`${addr.line1 || ''}`, 20, 67);
    doc.text(`${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`, 20, 72);
    doc.text(`Phone: ${addr.phone || 'N/A'}`, 20, 77);

    doc.setFont('helvetica', 'bold');
    doc.text('ORDER DETAILS:', 140, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${order.orderId || 'N/A'}`, 140, 62);
    doc.text(`Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}`, 140, 67);
    doc.text(`Status: ${order.status || 'Pending'}`, 140, 72);
    doc.text(`Payment: ${order.paymentMethod || 'COD'}`, 140, 77);

    // Products Table
    const items = order.items || [];
    const tableData = items.map((item: any) => [
      item.name || 'Unknown Product',
      item.quantity || 1,
      `INR ${item.price || 0}`,
      `INR ${(item.price || 0) * (item.quantity || 1)}`
    ]);

    autoTable(doc, {
      startY: 90,
      head: [['Product Name', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      headStyles: { fillColor: black, textColor: gold, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { left: 20, right: 20 },
    });

    // Totals Section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Subtotal:', 140, finalY);
    doc.text(`INR ${order.subtotal || 0}`, 190, finalY, { align: 'right' });
    
    if (order.discount > 0) {
      doc.setTextColor(200, 0, 0);
      doc.text(`Discount:`, 140, finalY + 7);
      doc.text(`- INR ${order.discount}`, 190, finalY + 7, { align: 'right' });
    }
    
    doc.setTextColor(0, 0, 0);
    doc.text('Delivery:', 140, finalY + 14);
    doc.text(`${order.deliveryCharge === 0 ? 'FREE' : `INR ${order.deliveryCharge || 0}`}`, 190, finalY + 14, { align: 'right' });

    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(135, finalY + 18, 190, finalY + 18);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('GRAND TOTAL:', 140, finalY + 28);
    doc.setTextColor(...gold);
    doc.text(`INR ${order.total || 0}`, 190, finalY + 28, { align: 'right' });

    // Footer Section
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for choosing Royal Bangles. Your elegance is our masterpiece.', 105, 280, { align: 'center' });

    // Download the file
    doc.save(`Invoice_${order.orderId || 'Order'}.pdf`);
  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    alert("Invoice Error: " + (error.message || "Unknown Error") + ". Please try again or contact support.");
  }
};
