"use client"

import React, { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { Package, DollarSign, AlertTriangle, ShoppingCart, RefreshCw, ArrowRight } from "lucide-react"

interface ComponentItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  categoryName: string;
  supplierName: string;
}

interface OrderItem {
  id: number;
}

export function InventoryView() {
  const [components, setComponents] = useState<ComponentItem[]>([])
  const [ordersCount, setOrdersCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}` };
      
      const [compRes, ordRes] = await Promise.all([
        axios.get("https://localhost:7284/api/Components", { headers }),
        axios.get("https://localhost:7284/api/Orders", { headers })
      ]);
      
      setComponents(compRes.data);
      setOrdersCount(ordRes.data.length);
    } catch (err) {
      console.error("Помилка завантаження дашборду:", err);
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // --- РОЗРАХУНКИ СТАТИСТИКИ ---
  const stats = useMemo(() => {
    let totalItems = 0;
    let totalValue = 0;
    const lowStock: ComponentItem[] = [];

    components.forEach(item => {
      totalItems += item.quantity;
      totalValue += (item.quantity * item.price);
      
      // Якщо товару менше 5 штук — додаємо в критичні залишки
      if (item.quantity < 5) {
        lowStock.push(item);
      }
    });

    // Сортуємо критичні залишки від найменшого до найбільшого
    lowStock.sort((a, b) => a.quantity - b.quantity);

    return { totalItems, totalValue, lowStock };
  }, [components]);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-gray-500">Завантаження статистики...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Дашборд</h1>
          <p className="text-muted-foreground">Загальна статистика складу та критичні залишки.</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100 transition text-sm">
          <RefreshCw className="w-4 h-4" /> Оновити
        </button>
      </div>

      {/* ВЕРХНІЙ РЯД: КАРТКИ СТАТИСТИКИ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-lg border shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Товарів на складі</p>
            <h3 className="text-3xl font-bold text-gray-900">{stats.totalItems} <span className="text-base font-normal text-gray-500">шт.</span></h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-100 text-green-600 rounded-full">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Загальна вартість</p>
            <h3 className="text-3xl font-bold text-gray-900">${stats.totalValue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-full">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Всього замовлень</p>
            <h3 className="text-3xl font-bold text-gray-900">{ordersCount}</h3>
          </div>
        </div>

      </div>

      {/* НИЖНІЙ РЯД: КРИТИЧНІ ЗАЛИШКИ */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden border-t-4 border-red-500">
        <div className="p-4 bg-red-50/50 border-b flex justify-between items-center">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-bold">Критичні залишки (Менше 5 шт.)</h2>
          </div>
          <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-200">
            Потребують замовлення: {stats.lowStock.length}
          </span>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">Назва компонента</th>
              <th className="p-4 font-medium text-gray-500">Категорія</th>
              <th className="p-4 font-medium text-gray-500">Постачальник</th>
              <th className="p-4 font-medium text-gray-500 text-right">Залишок</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {stats.lowStock.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-4xl mb-2">🎉</span>
                    <p>Всі товари в достатній кількості!</p>
                  </div>
                </td>
              </tr>
            ) : (
              stats.lowStock.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4 text-gray-600">{item.categoryName}</td>
                  <td className="p-4 text-gray-600">{item.supplierName}</td>
                  <td className="p-4 text-right">
                    <span className={`inline-flex items-center gap-1 font-bold ${item.quantity === 0 ? 'text-red-600 bg-red-100 px-2 py-1 rounded' : 'text-orange-600'}`}>
                      {item.quantity} шт.
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}