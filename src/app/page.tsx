"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const jerseyTypes = [
  { id: "black-s", design: "Black Palestine Jersey", color: "black", size: "S" },
  { id: "black-m", design: "Black Palestine Jersey", color: "black", size: "M" },
  { id: "black-l", design: "Black Palestine Jersey", color: "black", size: "L" },
  { id: "black-xl", design: "Black Palestine Jersey", color: "black", size: "XL" },
  { id: "white-s", design: "White Falastin Jersey", color: "white", size: "S" },
  { id: "white-m", design: "White Falastin Jersey", color: "white", size: "M" },
  { id: "white-l", design: "White Falastin Jersey", color: "white", size: "L" },
  { id: "white-xl", design: "White Falastin Jersey", color: "white", size: "XL" },
];

export default function Home() {
  const [inventory, setInventory] = useState(() =>
    jerseyTypes.map((item) => ({ ...item, count: 0 }))
  );

  const handleCountChange = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, count: Math.max(item.count + delta, 0) } : item
      )
    );
  };

  return (
    <main className="p-6 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Event Setup</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {inventory.map((item) => (
          <Card key={item.id} className="bg-gray-900">
            <CardContent className="flex justify-between items-center p-4">
              <div>
                <div className="font-semibold">{item.design}</div>
                <div className="text-sm text-gray-400">Size: {item.size}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => handleCountChange(item.id, -1)}>-</Button>
                <span>{item.count}</span>
                <Button onClick={() => handleCountChange(item.id, 1)}>+</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <Button 
          className="bg-red-600 hover:bg-red-700"
          onClick={() => {
            // Save inventory to localStorage (we'll implement this properly later)
            localStorage.setItem('jerseyInventory', JSON.stringify(inventory));
            window.location.href = "/sales";
          }}
        >
          Start Event
        </Button>
      </div>
    </main>
  );
}
