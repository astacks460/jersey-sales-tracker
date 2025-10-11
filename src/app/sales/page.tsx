"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type JerseyItem = {
  id: string;
  design: string;
  color: string;
  size: string;
  count: number;
};

type PaymentMethod = "Cash" | "Venmo" | "Zelle" | "PayPal" | "Ashraf Personal" | "Samy Personal";

type PaymentBreakdown = {
  [key in PaymentMethod]: number;
};

type Sale = {
  timestamp: string;
  jerseyId: string;
  design: string;
  size: string;
  priceSold: number;
  paymentMethod: PaymentMethod;
  discountType: string | null;
  discountValue: number;
};

export default function SalesPage() {
  const [inventory, setInventory] = useState<JerseyItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown>({
    Cash: 0,
    Venmo: 0,
    Zelle: 0,
    PayPal: 0,
    "Ashraf Personal": 0,
    "Samy Personal": 0
  });
  
  // Sale modal state
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<JerseyItem | null>(null);
  const [salePrice, setSalePrice] = useState(65);
  const [discountType, setDiscountType] = useState<string | null>(null);
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  
  // Load data on initial render
  useEffect(() => {
    // Try to load inventory from localStorage
    const savedInventory = localStorage.getItem('jerseyInventory');
    
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    } else {
      // Fallback sample data
      const sampleInventory = [
        { id: "black-s", design: "Black Palestine Jersey", color: "black", size: "S", count: 5 },
        { id: "black-m", design: "Black Palestine Jersey", color: "black", size: "M", count: 8 },
        { id: "black-l", design: "Black Palestine Jersey", color: "black", size: "L", count: 6 },
        { id: "black-xl", design: "Black Palestine Jersey", color: "black", size: "XL", count: 3 },
        { id: "white-s", design: "White Falastin Jersey", color: "white", size: "S", count: 4 },
        { id: "white-m", design: "White Falastin Jersey", color: "white", size: "M", count: 7 },
        { id: "white-l", design: "White Falastin Jersey", color: "white", size: "L", count: 5 },
        { id: "white-xl", design: "White Falastin Jersey", color: "white", size: "XL", count: 2 },
      ];
      setInventory(sampleInventory);
    }
    
    // Load sales data
    const savedSales = localStorage.getItem('jerseySales');
    if (savedSales) {
      const parsedSales = JSON.parse(savedSales);
      setSales(parsedSales);
      
      // Calculate totals
      calculateTotals(parsedSales);
    }
  }, []);
  
  // Calculate totals from sales data
  const calculateTotals = (salesData: Sale[]) => {
    const total = salesData.reduce((sum, sale) => sum + sale.priceSold, 0);
    setTotalRevenue(total);
    
    // Calculate payment breakdown
    const breakdown = salesData.reduce((acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.priceSold;
      return acc;
    }, {
      Cash: 0,
      Venmo: 0,
      Zelle: 0,
      PayPal: 0,
      "Ashraf Personal": 0,
      "Samy Personal": 0
    } as PaymentBreakdown);
    
    setPaymentBreakdown(breakdown);
  };
  
  // Handle when a jersey is clicked for sale
  const handleSaleClick = (item: JerseyItem) => {
    setCurrentItem(item);
    setSalePrice(65); // Reset to default price
    setDiscountType(null);
    setDiscountValue(0);
    setPaymentMethod("Cash");
    setSaleModalOpen(true);
  };
  
  // Apply discount to price
  const calculateFinalPrice = () => {
    if (!discountType || discountValue <= 0) return 65;
    
    if (discountType === "flat") {
      return 65 - discountValue;
    } else if (discountType === "percent") {
      return 65 - (65 * (discountValue / 100));
    }
    
    return 65;
  };
  
  // Handle discount type change
  const handleDiscountTypeChange = (value: string) => {
    if (value === "none") {
      setDiscountType(null);
      setDiscountValue(0);
      setSalePrice(65);
    } else {
      setDiscountType(value);
      // Keep existing discount value
      const finalPrice = value === "flat" 
        ? 65 - discountValue 
        : 65 - (65 * (discountValue / 100));
      setSalePrice(finalPrice);
    }
  };
  
  // Handle discount value change
  const handleDiscountValueChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setDiscountValue(numValue);
    
    if (discountType === "flat") {
      setSalePrice(65 - numValue);
    } else if (discountType === "percent") {
      setSalePrice(65 - (65 * (numValue / 100)));
    }
  };
  
  // Complete the sale
  const handleCompleteSale = () => {
    if (!currentItem) return;
    
    // Create new sale record
    const finalPrice = calculateFinalPrice();
    const newSale: Sale = {
      timestamp: new Date().toISOString(),
      jerseyId: currentItem.id,
      design: currentItem.design,
      size: currentItem.size,
      priceSold: finalPrice,
      paymentMethod: paymentMethod,
      discountType: discountType,
      discountValue: discountValue,
    };
    
    // Update inventory
    const updatedInventory = inventory.map(item => 
      item.id === currentItem.id 
        ? { ...item, count: item.count - 1 }
        : item
    );
    
    // Update sales
    const updatedSales = [...sales, newSale];
    
    // Save everything
    setInventory(updatedInventory);
    setSales(updatedSales);
    calculateTotals(updatedSales);
    
    // Update localStorage
    localStorage.setItem('jerseyInventory', JSON.stringify(updatedInventory));
    localStorage.setItem('jerseySales', JSON.stringify(updatedSales));
    
    // Close modal
    setSaleModalOpen(false);
  };

  // Undo last sale
  const handleUndoLastSale = () => {
    if (sales.length === 0) return;
    
    // Get the last sale
    const lastSale = sales[sales.length - 1];
    
    // Update inventory (increment the count back)
    const updatedInventory = inventory.map(item => 
      item.id === lastSale.jerseyId 
        ? { ...item, count: item.count + 1 }
        : item
    );
    
    // Remove the last sale
    const updatedSales = sales.slice(0, -1);
    
    // Update state
    setInventory(updatedInventory);
    setSales(updatedSales);
    calculateTotals(updatedSales);
    
    // Update localStorage
    localStorage.setItem('jerseyInventory', JSON.stringify(updatedInventory));
    localStorage.setItem('jerseySales', JSON.stringify(updatedSales));
  };
  
  return (
    <main className="p-6 bg-black min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Tracker</h1>
        <div className="text-xl font-bold">Total: ${totalRevenue.toFixed(2)}</div>
      </div>
      
      {/* Payment Method Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
        {Object.entries(paymentBreakdown).map(([method, amount]) => (
          <Card key={method} className="bg-gray-900">
            <CardContent className="p-3">
              <div className="text-sm text-gray-400">{method}</div>
              <div className="font-bold">${amount.toFixed(2)}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Undo Last Sale Button */}
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          className="border-gray-700 text-gray-400"
          onClick={handleUndoLastSale}
          disabled={sales.length === 0}
        >
          Undo Last Sale
        </Button>
      </div>
      
      {/* Jersey Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {inventory.map((item) => (
          <Button
            key={item.id}
            className={`h-auto p-4 flex flex-col items-center justify-center ${
              item.count > 0 
                ? item.color === "black" ? "bg-gray-800" : "bg-gray-700" 
                : "bg-gray-900 opacity-50"
            }`}
            disabled={item.count === 0}
            onClick={() => handleSaleClick(item)}
          >
            <div className="font-semibold mb-1">{item.design}</div>
            <div className="text-sm text-gray-400">Size: {item.size}</div>
            <div className="mt-2 font-bold">Left: {item.count}</div>
          </Button>
        ))}
      </div>
      
      {/* Sale Modal */}
      <Dialog open={saleModalOpen} onOpenChange={setSaleModalOpen}>
        <DialogContent className="bg-gray-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>Complete Sale</DialogTitle>
            <DialogDescription>
              {currentItem?.design} - Size {currentItem?.size}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Discount Type</Label>
              <RadioGroup 
                value={discountType || "none"} 
                onValueChange={handleDiscountTypeChange}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-md">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none">None</Label>
                </div>
                <div className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-md">
                  <RadioGroupItem value="flat" id="flat" />
                  <Label htmlFor="flat">Flat ($)</Label>
                </div>
                <div className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-md">
                  <RadioGroupItem value="percent" id="percent" />
                  <Label htmlFor="percent">Percent (%)</Label>
                </div>
              </RadioGroup>
            </div>
            
            {discountType && (
              <div className="grid gap-2">
                <Label>Discount Value ({discountType === "flat" ? "$" : "%"})</Label>
                <Input 
                  type="number"
                  min="0"
                  max={discountType === "flat" ? "65" : "100"}
                  value={discountValue}
                  onChange={(e) => handleDiscountValueChange(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            )}
            
            <div className="grid gap-2">
              <Label>Payment Method</Label>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                className="grid grid-cols-2 gap-2"
              >
                {["Cash", "Venmo", "Zelle", "PayPal", "Ashraf Personal", "Samy Personal"].map((method) => (
                  <div 
                    key={method}
                    className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-md"
                  >
                    <RadioGroupItem value={method} id={method.toLowerCase().replace(' ', '-')} />
                    <Label htmlFor={method.toLowerCase().replace(' ', '-')}>{method}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="text-center mt-2">
              <div className="text-sm text-gray-400">Final Price:</div>
              <div className="text-2xl font-bold">${salePrice.toFixed(2)}</div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaleModalOpen(false)}
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteSale}
              className="bg-red-600 hover:bg-red-700"
            >
              Complete Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          Back to Setup
        </Button>
        <Button className="bg-red-600 hover:bg-red-700" onClick={() => window.location.href = '/summary'}>
          End Event
        </Button>
      </div>
    </main>
  );
}
