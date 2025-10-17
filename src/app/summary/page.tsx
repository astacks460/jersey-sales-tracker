"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type Sale = {
  timestamp: string;
  jerseyId: string;
  design: string;
  size: string;
  priceSold: number;
  paymentMethod: string;
  discountType: string | null;
  discountValue: number;
  category?: string;
  type?: string;
};

type JerseyItem = {
  id: string;
  design: string;
  color: string;
  size: string;
  count: number;
  category?: string;
  type?: string;
};

export default function SummaryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [initialInventory, setInitialInventory] = useState<JerseyItem[]>([]);
  const [remainingInventory, setRemainingInventory] = useState<JerseyItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paymentBreakdown, setPaymentBreakdown] = useState({
    Cash: 0,
    Venmo: 0,
    Zelle: 0,
    PayPal: 0,
    "Ashraf Personal": 0,
    "Samy Personal": 0,
  });
  
  useEffect(() => {
    // Load sales data from localStorage
    const savedSales = localStorage.getItem('jerseySales');
    const savedInitial = localStorage.getItem('initialInventory');
    const savedRemaining = localStorage.getItem('jerseyInventory');
    
    if (savedSales) {
      const parsedSales = JSON.parse(savedSales);
      setSales(parsedSales);
      
      // Calculate totals
      const total = parsedSales.reduce((sum: number, sale: Sale) => sum + sale.priceSold, 0);
      setTotalRevenue(total);
      
      // Calculate payment breakdown
      const breakdown = parsedSales.reduce((acc: Record<string, number>, sale: Sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.priceSold;
        return acc;
      }, {
        Cash: 0,
        Venmo: 0,
        Zelle: 0,
        PayPal: 0,
        "Ashraf Personal": 0,
        "Samy Personal": 0,
      });
      
      setPaymentBreakdown(breakdown);
    }
    
    if (savedInitial) {
      setInitialInventory(JSON.parse(savedInitial));
    }
    
    if (savedRemaining) {
      setRemainingInventory(JSON.parse(savedRemaining));
    }
  }, []);
  
const handleExport = () => {
    // Load event info
    const savedEventInfo = localStorage.getItem('eventInfo');
    const eventInfo = savedEventInfo ? JSON.parse(savedEventInfo) : {
      name: "Untitled Event",
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toISOString()
    };
    
    // Create comprehensive CSV data
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Event Summary
    csvContent += "EVENT SUMMARY\n";
    csvContent += `Event Name,${eventInfo.name}\n`;
    csvContent += `Event Date,${new Date(eventInfo.date).toLocaleDateString()}\n`;
    csvContent += `Start Time,${new Date(eventInfo.startTime).toLocaleString()}\n`;
    csvContent += `Export Time,${new Date().toLocaleString()}\n`;
    csvContent += `Total Revenue,$${totalRevenue.toFixed(2)}\n`;
    csvContent += `Total Items Sold,${totalSoldItems}\n`;
    csvContent += `Total Transactions,${sales.length}\n\n`;
    
    // Payment Breakdown
    csvContent += "PAYMENT BREAKDOWN\n";
    csvContent += "Payment Method,Amount\n";
    Object.entries(paymentBreakdown).forEach(([method, amount]) => {
      csvContent += `${method},$${amount.toFixed(2)}\n`;
    });
    csvContent += "\n";
    
// Initial vs Remaining Inventory
    csvContent += "INVENTORY TRACKING\n";
    csvContent += "Category,Size,Initial Count,Remaining Count,Sold Count\n";
    
    initialInventory.forEach(initialItem => {
      const remainingItem = remainingInventory.find(r => r.id === initialItem.id);
      const remaining = remainingItem ? remainingItem.count : 0;
      const sold = initialItem.count - remaining;
      
      csvContent += `${initialItem.category || 'Unknown'},${initialItem.size},${initialItem.count},${remaining},${sold}\n`;
    });
    csvContent += "\n";
    
    // Individual Sales
    csvContent += "SALES DETAILS\n";
    csvContent += "Time,Category,Jersey,Size,Original Price,Discount Type,Discount Value,Final Price,Payment Method\n";
    
    sales.forEach(sale => {
      
      const originalPrice = sale.discountType ? 65 : sale.priceSold;
      
      csvContent += `${new Date(sale.timestamp).toLocaleString()},${sale.category || 'Unknown'},${sale.design},${sale.size},$${originalPrice.toFixed(2)},${sale.discountType || 'None'},${sale.discountValue || 0},$${sale.priceSold.toFixed(2)},${sale.paymentMethod}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    
    // Use event name in filename if available
    const eventName = eventInfo.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const dateStr = eventInfo.date;
    link.setAttribute("download", `${eventName}-${dateStr}-sales-report.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to start a new event? This will clear all sales data.")) {
      localStorage.removeItem('jerseySales');
      localStorage.removeItem('initialInventory');
      localStorage.removeItem('jerseyInventory');
      window.location.href = '/';
    }
  };
  
  // Group remaining inventory by category
  const groupedRemaining = remainingInventory.reduce((acc, item) => {
    const category = item.category || 'Unknown';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, JerseyItem[]>);

  // Calculate total sold items
  const totalSoldItems = initialInventory.reduce((total, initialItem) => {
    const remainingItem = remainingInventory.find(r => r.id === initialItem.id);
    const remaining = remainingItem ? remainingItem.count : 0;
    return total + (initialItem.count - remaining);
  }, 0);
  
  return (
    <main className="min-h-screen py-12">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="text-heading mb-4">Event Summary</h1>
          <p className="text-body text-muted-foreground">
            Complete overview of your jersey sales event
          </p>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="card-elevated text-center rounded-lg">
            <div className="p-8">
              <h2 className="text-subheading mb-4">Total Revenue</h2>
              <div className="text-4xl font-bold text-green-400 mb-2">
                ${totalRevenue.toFixed(2)}
              </div>
              <div className="text-body text-muted-foreground">
                From {sales.length} sales
              </div>
            </div>
          </div>
          
          <div className="card-elevated text-center rounded-lg">
            <div className="p-8">
              <h2 className="text-subheading mb-4">Items Sold</h2>
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {totalSoldItems}
              </div>
              <div className="text-body text-muted-foreground">
                Total jerseys sold
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Breakdown */}
        <div className="mb-12">
          <h2 className="text-subheading mb-6 text-center">Payment Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {Object.entries(paymentBreakdown).map(([method, amount]) => (
              <div key={method} className="card-elevated text-center rounded-lg">
                <div className="p-4">
                  <h3 className="text-body font-semibold mb-2">{method}</h3>
                  <div className="text-xl font-bold">${amount.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Remaining Inventory */}
        <div className="mb-12">
          <h2 className="text-subheading mb-6 text-center">Remaining Inventory</h2>
          <div className="space-y-6 max-w-6xl mx-auto">
            {Object.entries(groupedRemaining).map(([category, items]) => {
              const totalRemaining = items.reduce((sum, item) => sum + item.count, 0);
              
              return (
                <div key={category} className="card-elevated rounded-lg">
                  <div className="text-center p-6">
                    <h3 className="text-subheading flex items-center justify-center gap-4">
                      <span>{category}</span>
                      <span className="text-lg font-normal text-muted-foreground">
                        ({totalRemaining} remaining)
                      </span>
                    </h3>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {items.map((item) => (
                        <div key={item.id} className="text-center p-4 bg-secondary/30 rounded-lg">
                          <div className="text-body font-semibold mb-1">Size {item.size}</div>
                          <div className="text-2xl font-bold text-yellow-400">{item.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Sales Details */}
        <div className="mb-12">
          <h2 className="text-subheading mb-6 text-center">Recent Sales</h2>
          <div className="card-elevated max-w-6xl mx-auto rounded-lg">
            <div className="p-6">
              {sales.length > 0 ? (
                <div className="overflow-auto max-h-96">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-body font-semibold">Category</th>
                        <th className="text-left p-3 text-body font-semibold">Size</th>
                        <th className="text-left p-3 text-body font-semibold">Price</th>
                        <th className="text-left p-3 text-body font-semibold">Payment</th>
                        <th className="text-left p-3 text-body font-semibold">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.slice(-10).reverse().map((sale, index) => (
                        <tr key={index} className="border-b border-border/50">
                          <td className="p-3 text-body">{sale.category || 'Unknown'}</td>
                          <td className="p-3 text-body">{sale.size}</td>
                          <td className="p-3 text-body font-semibold">${sale.priceSold.toFixed(2)}</td>
                          <td className="p-3 text-body">{sale.paymentMethod}</td>
                          <td className="p-3 text-body">{new Date(sale.timestamp).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {sales.length > 10 && (
                    <div className="text-center mt-4 text-muted-foreground text-body">
                      Showing last 10 sales of {sales.length} total
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="text-body mb-2">No sales recorded yet</div>
                  <div className="text-sm">Start selling to see transaction details here</div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/sales'}
            className="px-8 py-4 h-auto text-body"
          >
            Back to Sales
          </Button>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleExport} 
              style={{ background: '#2563eb', color: '#ffffff' }}
              className="hover:bg-blue-700 px-8 py-4 h-auto text-body transition-all duration-200"
            >
              Export Complete CSV
            </Button>
            <Button 
              onClick={handleReset} 
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8 py-4 h-auto text-body"
            >
              Start New Event
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}