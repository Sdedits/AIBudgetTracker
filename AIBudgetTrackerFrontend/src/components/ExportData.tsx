import React, { useState } from 'react';
import { Download, FileText, Table, Cloud } from 'lucide-react';
import { getTransactions } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

const ExportData: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const exportToCSV = async () => {
    try {
      setLoading(true);
      const response = await getTransactions();
      const transactions = response.data;

      // Filter by date if specified
      let filteredTransactions = transactions;
      if (startDate && endDate) {
        filteredTransactions = transactions.filter((t: any) => {
          const transactionDate = new Date(t.transactionDate);
          return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
        });
      }

      const headers = ['ID', 'Type', 'Amount', 'Category', 'Description', 'Date'];
      
      const csvContent = [
        headers.join(','),
        ...filteredTransactions.map((t: any) => 
          [t.id, t.type, t.amount, t.category, t.description || '', t.transactionDate].join(',')
        )
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export data to CSV');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setLoading(true);
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentY = 20; 

      // Header
      doc.setFontSize(20);
      doc.text('BudgetWise Financial Report', 14, currentY);
      currentY += 10;

      doc.setFontSize(11);
      doc.setTextColor(100);
      const dateText = `Generated on: ${new Date().toLocaleDateString()}`;
      doc.text(dateText, 14, currentY);
      currentY += 10;

      if (startDate && endDate) {
        doc.text(`Period: ${startDate} to ${endDate}`, 14, currentY);
        currentY += 10;
      }

      // Capture Graphs (Pie/Bar Charts) from DOM
      const graphsElement = document.getElementById('dashboard-graphs');
      if (graphsElement) {
        try {
            // Scale 2 provides better resolution for PDF
            const canvas = await html2canvas(graphsElement, { scale: 2 }); 
            const imgData = canvas.toDataURL('image/png');
            const imgProps = doc.getImageProperties(imgData);
            
            // Calculate width/height to fit PDF margins
            const pdfImgWidth = pageWidth - 28; 
            const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;

            // Add new page if image overflows
            if (currentY + pdfImgHeight > pageHeight) {
                doc.addPage();
                currentY = 20;
            }

            doc.addImage(imgData, 'PNG', 14, currentY, pdfImgWidth, pdfImgHeight);
            currentY += pdfImgHeight + 10;
        } catch (err) {
            console.warn("Could not capture graphs:", err);
        }
      }

      // Capture AI Analytics Text from DOM
      const analyticsElement = document.getElementById('ai-analytics');
      if (analyticsElement) {
        try {
            const canvas = await html2canvas(analyticsElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const imgProps = doc.getImageProperties(imgData);
            
            const pdfImgWidth = pageWidth - 28;
            const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;

            if (currentY + pdfImgHeight > pageHeight) {
                doc.addPage();
                currentY = 20;
            }

            doc.text("AI Analytics & Insights", 14, currentY - 2);
            doc.addImage(imgData, 'PNG', 14, currentY, pdfImgWidth, pdfImgHeight);
            currentY += pdfImgHeight + 15;
        } catch (err) {
            console.warn("Could not capture analytics:", err);
        }
      }

      // Fetch Data for Table
      const response = await getTransactions();
      const transactions = response.data;
      
      let filteredTransactions = transactions;
      if (startDate && endDate) {
        filteredTransactions = transactions.filter((t: any) => {
          const transactionDate = new Date(t.transactionDate);
          return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
        });
      }

      const tableColumn = ["Date", "Type", "Category", "Description", "Amount"];
      const tableRows: any[] = [];

      filteredTransactions.forEach((t: any) => {
        const transactionData = [
          new Date(t.transactionDate).toLocaleDateString(),
          t.type.charAt(0).toUpperCase() + t.type.slice(1),
          t.category,
          t.description || '-',
          `${t.amount}`
        ];
        tableRows.push(transactionData);
      });

      if (currentY > pageHeight - 40) {
          doc.addPage();
          currentY = 20;
      }

      doc.text("Detailed Transaction History", 14, currentY);
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: currentY + 5,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      doc.save(`budgetwise_complete_report_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export data to PDF');
    } finally {
      setLoading(false);
    }
  };

  const backupToCloud = () => {
    alert('Cloud backup feature coming soon! This will allow you to backup your data to Google Drive or Dropbox.');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Download className="text-blue-600" />
        Export & Backup
      </h2>

      {/* Date Range Filter */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-3">Date Range (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={exportToCSV}
          disabled={loading}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all disabled:opacity-50"
        >
          <div className="flex flex-col items-center text-center">
            <Table className="text-green-600 mb-3" size={48} />
            <h3 className="font-semibold mb-2">Export to CSV</h3>
            <p className="text-sm text-gray-600">
              Download your transaction data in CSV format for use in Excel or other spreadsheet applications
            </p>
            <div className="mt-4 bg-green-100 text-green-700 px-4 py-2 rounded font-medium">
              Download CSV
            </div>
          </div>
        </button>

        <button
          onClick={exportToPDF}
          disabled={loading}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all disabled:opacity-50"
        >
          <div className="flex flex-col items-center text-center">
            <FileText className="text-red-600 mb-3" size={48} />
            <h3 className="font-semibold mb-2">Export Report</h3>
            <p className="text-sm text-gray-600">
              Generate a complete PDF report including Graphs, AI Insights, and Data
            </p>
            <div className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded font-medium">
              Download Report
            </div>
          </div>
        </button>

        <button
          onClick={backupToCloud}
          disabled={loading}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all disabled:opacity-50"
        >
          <div className="flex flex-col items-center text-center">
            <Cloud className="text-blue-600 mb-3" size={48} />
            <h3 className="font-semibold mb-2">Cloud Backup</h3>
            <p className="text-sm text-gray-600">
              Backup your data securely to Google Drive or Dropbox for safe keeping
            </p>
            <div className="mt-4 bg-blue-100 text-blue-700 px-4 py-2 rounded font-medium">
              Setup Backup
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ExportData;