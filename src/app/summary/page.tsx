"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Sale = {
  timestamp: string;
  jerseyId: string;
  design: string;
  size: string;
  priceSold: number;
  paymentMethod: string;
  discountType: string | null;
  discountValue: number;
};

export default function SummaryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paymentBreakdown, setPaymentBreakdown] = useState({
    Cash: 0,
    Venmo: 0,
    Zelle: 0,
    PayPal: 0,
  });
  
  useEffect(() => {
    // Load sales data from localStorage
    const savedSales = localStorage.getItem('jerseySales');
    if (savedSales) {
      const parsedSales = JSON.parse(savedSales);
      setSales(parsedSales);
      
      // Calculate totals
      const total = parsedSales.reduce((sum: number, sale: Sale) => sum + sale.priceSold, 0);
      setTotalRevenue(total);
      
      // Calculate payment breakdown
      const breakdown = parsedSales.reduce((acc: any, sale: Sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.priceSold;
        return acc;
      }, {
        Cash: 0,
        Venmo: 0,
        Zelle: 0,
        PayPal: 0,
      });
      
      setPaymentBreakdown(breakdown);
    }
  }, []);
  
  const handleExport = () => {
    // Create CSV data
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Time,Jersey,Size,Price,Payment Method,Discount\n";
    
    sales.forEach(sale => {
      const discountInfo = sale.discountType 
        ? `${sale.discountType === 'flat' ? '$' : '%'}${sale.discountValue}` 
        : 'None';
      
      csvContent += `${sale.timestamp},${sale.design},${sale.size},${sale.priceSold},${sale.paymentMethod},${discountInfo}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `jersey-sales-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };
  
  const handleReset = () => {
    if (confirm("Are you sure you want to start a new event? This will clear all sales data.")) {
      localStorage.removeItem('jerseySales');
      window.location.href = '/';
    }
  };
  
  return (
    <main className="p-6 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Event Summary</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-gray-900">
          <CardContent className="p-4">
            <h2 className="text-xl font-bold mb-2">Total Revenue</h2>
            <div className="text-3xl font-bold text-green-500">${totalRevenue}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900">
          <CardContent className="p-4">
            <h2 className="text-xl font-bold mb-2">Total Items Sold</h2>
            <div className="text-3xl font-bold text-blue-500">{sales.length}</div>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-xl font-bold mb-3">Payment Breakdown</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(paymentBreakdown).map(([method, amount]) => (
          <Card key={method} className="bg-gray-800">
            <CardContent className="p-4">
              <h3 className="text-lg font-bold">{method}</h3>
              <div className="text-2xl font-bold">${amount}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <h2 className="text-xl font-bold mb-3">Sales Details</h2>
      <div className="bg-gray-900 rounded-lg p-4 mb-6 max-h-96 overflow-auto">
        {sales.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Jersey</th>
                <th className="text-left p-2">Size</th>
                <th className="text-left p-2">Price</th>
                <th className="text-left p-2">Payment</th>
                <th className="text-left p-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, index) => (
                <tr key={index} className="border-b border-gray-800">
                  <td className="p-2">{sale.design}</td>
                  <td className="p-2">{sale.size}</td>
                  <td className="p-2">${sale.priceSold}</td>
                  <td className="p-2">{sale.paymentMethod}</td>
                  <td className="p-2">{new Date(sale.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-4 text-gray-400">No sales recorded yet</div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => window.location.href = '/sales'}>
          Back to Sales
        </Button>
        <div className="space-x-3">
          <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
            Export CSV
          </Button>
          <Button onClick={handleReset} className="bg-red-600 hover:bg-red-700">
            New Event
          </Button>
        </div>
      </div>
    </main>
  );
}
