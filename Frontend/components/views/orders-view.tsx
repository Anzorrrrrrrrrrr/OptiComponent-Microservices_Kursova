"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { Plus, RefreshCw, X, ShoppingCart, Package, Eye, Receipt } from "lucide-react" 

// Структура для одного рядка в чеку
interface OrderItemSummary {
  componentName: string;
  quantity: number;
  unitPrice: number;
}

interface OrderSummary {
  id: number;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  totalPrice: number;
  status: string;
  itemsCount: number;
  items: OrderItemSummary[]; 
}

interface ComponentItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export function OrdersView() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [components, setComponents] = useState<ComponentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Стан для перегляду деталей конкретного замовлення
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null)

  const [customerName, setCustomerName] = useState("")
  const [cartItem, setCartItem] = useState({ componentId: "", quantity: "1" })

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("https://localhost:7284/api/Orders", { headers: { Authorization: `Bearer ${token}` } })
      setOrders(response.data)
    } catch (err) {
      console.error("Помилка:", err)
      setError("Не вдалося завантажити замовлення.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchComponentsForCart = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("https://localhost:7284/api/Components", { headers: { Authorization: `Bearer ${token}` } })
      setComponents(response.data)
    } catch (err) {
      console.error("Помилка каталогу:", err)
    }
  }

  useEffect(() => {
    fetchOrders();
    fetchComponentsForCart();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault() 
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        customerName: customerName,
        items: [{ componentId: parseInt(cartItem.componentId), quantity: parseInt(cartItem.quantity) }]
      };

      await axios.post("https://localhost:7284/api/Orders", payload, { headers: { Authorization: `Bearer ${token}` } });

      setIsCreateModalOpen(false)
      setCustomerName("")
      setCartItem({ componentId: "", quantity: "1" })
      fetchOrders() 
      fetchComponentsForCart() 
    } catch (err: any) {
      console.error("Помилка створення:", err)
      if (err.response && err.response.data && err.response.data.message) {
        alert("Помилка: " + err.response.data.message);
      } else {
        alert("Не вдалося створити замовлення.");
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedComponent = components.find(c => c.id.toString() === cartItem.componentId);

  // Функція: Правильне форматування часу з урахуванням часового поясу (UTC -> Local)
  const formatLocalTime = (dateString: string) => {
    const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    return new Date(utcDateString).toLocaleString('uk-UA', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Замовлення</h1>
          <p className="text-muted-foreground">Управління продажами та списання зі складу.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100 transition text-sm">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Оновити
          </button>
          <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm whitespace-nowrap shadow-sm">
            <ShoppingCart className="w-4 h-4" />
            Нове замовлення
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-md border border-red-200">{error}</div>}

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">Номер</th>
              <th className="p-4 font-medium text-gray-500">Дата</th>
              <th className="p-4 font-medium text-gray-500">Клієнт</th>
              <th className="p-4 font-medium text-gray-500">Статус</th>
              <th className="p-4 font-medium text-gray-500 font-bold">Сума</th>
              <th className="p-4 font-medium text-gray-500 text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Завантаження...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Замовлень поки немає. Створіть перше!</td></tr>
            ) : (
              orders.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-blue-600">{item.orderNumber}</td>
                  {/* ВИПРАВЛЕНО ЧАС */}
                  <td className="p-4">{formatLocalTime(item.orderDate)}</td>
                  <td className="p-4">{item.customerName}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-900">${item.totalPrice.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(item)} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition text-xs font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" /> Деталі
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* МОДАЛКА ПЕРЕГЛЯДУ ДЕТАЛЕЙ ЗАМОВЛЕННЯ (ЧЕК) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-0 overflow-hidden border-t-4 border-blue-500">
            {/* Шапка чеку */}
            <div className="bg-gray-50 p-6 border-b text-center relative">
              <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
              <Receipt className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <h2 className="text-xl font-bold text-gray-900">{selectedOrder.orderNumber}</h2>
              {/* ВИПРАВЛЕНО ЧАС */}
              <p className="text-sm text-gray-500">{formatLocalTime(selectedOrder.orderDate)}</p>
            </div>
            
            {/* Дані клієнта */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Клієнт:</span>
                <span className="font-medium">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Статус:</span>
                <span className="font-medium text-yellow-600">{selectedOrder.status}</span>
              </div>

              <div className="border-t border-dashed my-4"></div>

              {/* Список товарів */}
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Позиції замовлення</h3>
              <ul className="space-y-3">
                {selectedOrder.items?.map((detail, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{detail.componentName}</span>
                      <span className="text-xs text-gray-500">{detail.quantity} шт. × ${detail.unitPrice.toFixed(2)}</span>
                    </div>
                    <span className="font-medium">${(detail.quantity * detail.unitPrice).toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-dashed my-4"></div>

              {/* Разом */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Разом:</span>
                <span className="text-green-600">${selectedOrder.totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Підвал */}
            <div className="bg-gray-50 p-4 border-t text-center">
              <button onClick={() => setSelectedOrder(null)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition text-sm font-medium">
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА СТВОРЕННЯ ЗАМОВЛЕННЯ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 border-t-4 border-green-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-600" /> Оформити замовлення
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ім'я клієнта</label>
                <input type="text" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full border rounded-md px-3 py-2 outline-none focus:border-green-500" placeholder="Наприклад: ТОВ Техноком" />
              </div>

              <div className="bg-gray-50 p-4 rounded-md border border-gray-100 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Кошик</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Оберіть деталь</label>
                  <select required value={cartItem.componentId} onChange={(e) => setCartItem({...cartItem, componentId: e.target.value})} className="w-full border rounded-md px-3 py-2 bg-white outline-none focus:border-green-500 cursor-pointer">
                    <option value="" disabled>Виберіть зі складу...</option>
                    {components.map(c => (
                      <option key={c.id} value={c.id} disabled={c.quantity <= 0}>
                        {c.name} (${c.price}) {c.quantity <= 0 ? '- НЕМАЄ В НАЯВНОСТІ' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Кількість (шт.)</label>
                    <input type="number" required min="1" max={selectedComponent?.quantity || 1} value={cartItem.quantity} onChange={(e) => setCartItem({...cartItem, quantity: e.target.value})} className="w-full border rounded-md px-3 py-2 outline-none focus:border-green-500" />
                  </div>
                  {selectedComponent && (
                    <div className="pb-2 text-sm text-gray-500 flex items-center gap-1">
                      <Package className="w-4 h-4" /> Доступно: <strong className="text-green-600">{selectedComponent.quantity}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50 transition">Скасувати</button>
                <button type="submit" disabled={isSubmitting || !cartItem.componentId} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 font-medium">
                  {isSubmitting ? "Обробка..." : "Підтвердити продаж"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}