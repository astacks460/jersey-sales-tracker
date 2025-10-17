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
  category: string;
  type: string;
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
  category: string;
  type: string;
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<JerseyItem | null>(null);
  const [salePrice, setSalePrice] = useState(65);
  const [discountType, setDiscountType] = useState<string | null>(null);
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  
  // Category selection modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  
  // Load data on initial render
  useEffect(() => {
    const savedInventory = localStorage.getItem('jerseyInventory');
    
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    } else {
      // Fallback sample data
      const sampleInventory = [
        { id: "black-s", design: "Black Palestine Jersey", color: "black", size: "S", count: 5, category: "Black Hockey", type: "hockey" },
        { id: "black-m", design: "Black Palestine Jersey", color: "black", size: "M", count: 8, category: "Black Hockey", type: "hockey" },
        { id: "black-l", design: "Black Palestine Jersey", color: "black", size: "L", count: 6, category: "Black Hockey", type: "hockey" },
        { id: "black-xl", design: "Black Palestine Jersey", color: "black", size: "XL", count: 3, category: "Black Hockey", type: "hockey" },
        { id: "white-s", design: "White Falastin Jersey", color: "white", size: "S", count: 4, category: "White Hockey", type: "hockey" },
        { id: "white-m", design: "White Falastin Jersey", color: "white", size: "M", count: 7, category: "White Hockey", type: "hockey" },
        { id: "white-l", design: "White Falastin Jersey", color: "white", size: "L", count: 5, category: "White Hockey", type: "hockey" },
        { id: "white-xl", design: "White Falastin Jersey", color: "white", size: "XL", count: 2, category: "White Hockey", type: "hockey" },
      ];
      setInventory(sampleInventory);
    }
    
    // Load sales data
    const savedSales = localStorage.getItem('jerseySales');
    if (savedSales) {
      const parsedSales = JSON.parse(savedSales);
      setSales(parsedSales);
      calculateTotals(parsedSales);
    }
  }, []);
  
  // Calculate totals from sales data
  const calculateTotals = (salesData: Sale[]) => {
    const total = salesData.reduce((sum, sale) => sum + sale.priceSold, 0);
    setTotalRevenue(total);
    
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
  
  // Get unique categories from inventory
  const categories = [...new Set(inventory.map(item => item.category))];
  
  // Handle category selection
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSelectedSize(null);
    setCategoryModalOpen(true);
  };
  
  // Handle size selection and proceed to sale
  const handleSizeSelect = (size: string) => {
    if (!selectedCategory) return;
    
    const item = inventory.find(item => 
      item.category === selectedCategory && item.size === size && item.count > 0
    );
    
    if (!item) return;
    
    setCurrentItem(item);
    setSalePrice(65);
    setDiscountType(null);
    setDiscountValue(0);
    setPaymentMethod("Cash");
    setCategoryModalOpen(false);
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
      category: currentItem.category,
      type: currentItem.type,
    };
    
    const updatedInventory = inventory.map(item => 
      item.id === currentItem.id 
        ? { ...item, count: item.count - 1 }
        : item
    );
    
    const updatedSales = [...sales, newSale];
    
    setInventory(updatedInventory);
    setSales(updatedSales);
    calculateTotals(updatedSales);
    
    localStorage.setItem('jerseyInventory', JSON.stringify(updatedInventory));
    localStorage.setItem('jerseySales', JSON.stringify(updatedSales));
    
    setSaleModalOpen(false);
  };

  // Undo last sale
  const handleUndoLastSale = () => {
    if (sales.length === 0) return;
    
    const lastSale = sales[sales.length - 1];
    
    const updatedInventory = inventory.map(item => 
      item.id === lastSale.jerseyId 
        ? { ...item, count: item.count + 1 }
        : item
    );
    
    const updatedSales = sales.slice(0, -1);
    
    setInventory(updatedInventory);
    setSales(updatedSales);
    calculateTotals(updatedSales);
    
    localStorage.setItem('jerseyInventory', JSON.stringify(updatedInventory));
    localStorage.setItem('jerseySales', JSON.stringify(updatedSales));
  };
  return (
    <main className="min-h-screen py-8">
      <div className="container-custom">
        <div className="text-center mb-8">
          <h1 className="text-heading mb-2">Sales Tracker</h1>
          <div className="text-2xl font-bold text-green-400">
            Total Revenue: ${totalRevenue.toFixed(2)}
          </div>
        </div>
        
        {/* Payment Method Summary */}
        <div className="mb-8">
          <h2 className="text-subheading mb-4 text-center">Payment Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {Object.entries(paymentBreakdown).map(([method, amount]) => (
              <div key={method} className="card-elevated text-center rounded-lg">
                <div className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">{method}</div>
                  <div className="text-body font-bold">${amount.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Undo Last Sale Button */}
        <div className="flex justify-center mb-8">
          <Button
            variant="outline"
            className="px-6 py-3 h-auto text-body"
            onClick={handleUndoLastSale}
            disabled={sales.length === 0}
          >
            Undo Last Sale
          </Button>
        </div>
        
        {/* Category Selection */}
        <div className="mb-8">
          <h2 className="text-subheading mb-6 text-center">Select Jersey Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {categories.map((category) => {
              const categoryItems = inventory.filter(item => item.category === category);
              const totalCount = categoryItems.reduce((sum, item) => sum + item.count, 0);
              
              return (
                <Button
                  key={category}
                  className="h-auto p-8 flex flex-col items-center justify-center card-elevated border-0 hover:scale-105 transition-all duration-200"
                  disabled={totalCount === 0}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="text-xl font-bold mb-3">{category}</div>
                  <div className="text-lg" style={{ color: '#3a3b3a' }}>
                    {totalCount > 0 ? `${totalCount} available` : 'Sold out'}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
        
        {/* Category Size Selection Modal */}
        <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
          <DialogContent className="card-elevated max-w-2xl">
            <DialogHeader className="text-center">
              <DialogTitle className="text-subheading">{selectedCategory}</DialogTitle>
              <DialogDescription className="text-body">
                Choose the size being sold
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedCategory && inventory
                  .filter(item => item.category === selectedCategory && item.count > 0)
                  .map((item) => (
                    <Button
                      key={item.size}
                      className="h-20 card-elevated border-0 hover:scale-105 transition-all duration-200"
                      onClick={() => handleSizeSelect(item.size)}
                    >
                      <div className="text-center">
                        <div className="text-xl font-bold">{item.size}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.count} left
                        </div>
                      </div>
                    </Button>
                  ))}
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCategoryModalOpen(false)}
                className="px-6 py-3 h-auto text-body"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Sale Modal */}
        <Dialog open={saleModalOpen} onOpenChange={setSaleModalOpen}>
          <DialogContent className="card-elevated max-w-lg">
            <DialogHeader className="text-center">
              <DialogTitle className="text-subheading">Complete Sale</DialogTitle>
              <DialogDescription className="text-body">
                {currentItem?.design} - Size {currentItem?.size}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-6">
              <div className="space-y-3">
                <Label className="text-body font-semibold">Discount Type</Label>
                <RadioGroup 
                  value={discountType || "none"} 
                  onValueChange={handleDiscountTypeChange}
                  className="grid grid-cols-3 gap-3"
                >
                  <div className="flex items-center space-x-2 bg-secondary/50 px-4 py-3 rounded-lg">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none" className="text-body">None</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-secondary/50 px-4 py-3 rounded-lg">
                    <RadioGroupItem value="flat" id="flat" />
                    <Label htmlFor="flat" className="text-body">Flat ($)</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-secondary/50 px-4 py-3 rounded-lg">
                    <RadioGroupItem value="percent" id="percent" />
                    <Label htmlFor="percent" className="text-body">Percent (%)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {discountType && (
                <div className="space-y-3">
                  <Label className="text-body font-semibold">
                    Discount Value ({discountType === "flat" ? "$" : "%"})
                  </Label>
                  <Input 
                    type="number"
                    min="0"
                    max={discountType === "flat" ? "65" : "100"}
                    value={discountValue}
                    onChange={(e) => handleDiscountValueChange(e.target.value)}
                    className="text-center text-lg h-12 bg-secondary/50"
                  />
                </div>
              )}
              
              <div className="space-y-3">
                <Label className="text-body font-semibold">Payment Method</Label>
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="grid grid-cols-2 gap-3"
                >
                  {["Cash", "Venmo", "Zelle", "PayPal", "Ashraf Personal", "Samy Personal"].map((method) => (
                    <div 
                      key={method}
                      className="flex items-center space-x-2 bg-secondary/50 px-3 py-3 rounded-lg"
                    >
                      <RadioGroupItem value={method} id={method.toLowerCase().replace(' ', '-')} />
                      <Label htmlFor={method.toLowerCase().replace(' ', '-')} className="text-sm">
                        {method}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="text-center p-6 bg-accent rounded-lg">
                <div className="text-body text-muted-foreground mb-2">Final Price:</div>
                <div className="text-3xl font-bold text-green-400">${salePrice.toFixed(2)}</div>
              </div>
            </div>
            
            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setSaleModalOpen(false)}
                className="px-6 py-3 h-auto text-body flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompleteSale}
                className="button-primary px-6 py-3 h-auto text-body flex-1"
              >
                Complete Sale
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <div className="flex justify-between max-w-2xl mx-auto mt-12">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 h-auto text-body"
          >
            Back to Setup
          </Button>
          <Button 
            style={{ background: '#750105', color: '#ffffff' }}
            className="hover:bg-red-700 px-6 py-3 h-auto text-body" 
            onClick={() => window.location.href = '/summary'}
          >
            End Event
          </Button>
        </div>
      </div>
    </main>
  );
}