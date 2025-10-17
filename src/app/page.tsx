"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const jerseyCategories = {
  "Black Hockey": {
    type: "hockey",
    design: "Black Palestine Jersey",
    color: "black",
    sizes: ["S", "M", "L", "XL"]
  },
  "White Hockey": {
    type: "hockey", 
    design: "White Falastin Jersey",
    color: "white",
    sizes: ["S", "M", "L", "XL"]
  },
  "Green Soccer": {
    type: "soccer",
    design: "Green Soccer Jersey", 
    color: "green",
    sizes: ["S", "M", "L", "XL", "2XL"]
  }
};

const generateJerseyTypes = () => {
  const types: Array<{
    id: string;
    design: string;
    color: string;
    size: string;
    category: string;
    type: string;
}> = [];  Object.entries(jerseyCategories).forEach(([categoryName, category]) => {
    category.sizes.forEach(size => {
      types.push({
        id: `${category.color}-${size.toLowerCase()}`,
        design: category.design,
        color: category.color,
        size: size,
        category: categoryName,
        type: category.type
      });
    });
  });
  return types;
};

const jerseyTypes = generateJerseyTypes();

export default function Home() {
  const [inventory, setInventory] = useState(() =>
    jerseyTypes.map((item) => ({ ...item, count: 0 }))
  );
  
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const handleCountChange = (id: string, value: string) => {
    const count = parseInt(value) || 0;
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, count: Math.max(count, 0) } : item
      )
    );
  };

  const groupedInventory = Object.entries(jerseyCategories).map(([categoryName, category]) => {
    const categoryItems = inventory.filter(item => item.category === categoryName);
    return { categoryName, category, items: categoryItems };
  });

  const totalItems = inventory.reduce((sum, item) => sum + item.count, 0);

  const handleStartEvent = () => {
    const eventInfo = {
      name: eventName || "Untitled Event",
      date: eventDate,
      startTime: new Date().toISOString()
    };
    
    localStorage.setItem('jerseyInventory', JSON.stringify(inventory));
    localStorage.setItem('initialInventory', JSON.stringify(inventory));
    localStorage.setItem('eventInfo', JSON.stringify(eventInfo));
    window.location.href = "/sales";
  };

  return (
    <main className="min-h-screen py-12">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="text-heading mb-4">Event Setup</h1>
          <p className="text-body text-muted-foreground">
            Configure your event details and jersey inventory
          </p>
        </div>
        
        {/* Event Information */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="card-elevated rounded-lg">
            <div className="text-center p-6 pb-4">
              <h2 className="text-subheading">Event Information</h2>
            </div>
            <div className="p-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="eventName" className="text-body font-semibold">
                    Event Name
                  </Label>
                  <Input
                    id="eventName"
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="text-lg h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                    placeholder="e.g., CulturaCon"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="eventDate" className="text-body font-semibold">
                    Event Date
                  </Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="text-lg h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
{/* Inventory Setup */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h2 className="text-subheading mb-4">Jersey Inventory</h2>
            {totalItems > 0 && (
              <div className="inline-flex items-center px-4 py-2 card-elevated rounded-full">
                <span className="text-body">Total Items: {totalItems}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-8">
            {groupedInventory.map(({ categoryName, items }) => (
              <div key={categoryName} className="w-full">
                <div className="card-elevated rounded-lg mx-auto" style={{ maxWidth: 'fit-content' }}>
                  <div className="text-center p-6 pb-6">
                    <h3 className="text-subheading">{categoryName}</h3>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="grid gap-6" style={{ 
                      gridTemplateColumns: `repeat(${items.length}, minmax(120px, 1fr))`,
                      justifyContent: 'center'
                    }}>
                      {items.map((item) => (
                        <div key={item.id} className="space-y-3">
                          <Label 
                            htmlFor={item.id} 
                            className="text-body font-semibold block text-center"
                          >
                            Size {item.size}
                          </Label>
                          <Input
                            id={item.id}
                            type="number"
                            min="0"
                            value={item.count || ''}
                            onChange={(e) => handleCountChange(item.id, e.target.value)}
                            className="text-center text-xl h-14 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                            placeholder="0"
                            style={{ width: '120px' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center">
           <Button 
            style={{ background: '#194538', color: '#ffffff' }}
            className="hover:bg-blue-700 px-12 py-6 h-auto text-body transition-all duration-200"
            onClick={handleStartEvent}
            disabled={totalItems === 0}
          >
            Start Event
            {totalItems > 0 && (
              <span className="ml-2 bg-black/20 px-2 py-1 rounded-md text-sm">
                {totalItems} items
              </span>
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}