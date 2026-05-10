"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { Plus, Trash2, Folder, Truck, RefreshCw } from "lucide-react"

interface DictItem {
  id: number;
  name: string;
}

export function DictionariesView() {
  const [categories, setCategories] = useState<DictItem[]>([])
  const [suppliers, setSuppliers] = useState<DictItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [newCategoryName, setNewCategoryName] = useState("")
  const [newSupplierName, setNewSupplierName] = useState("")

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}` };
      
      const [catRes, supRes] = await Promise.all([
        axios.get("https://localhost:7284/api/Categories", { headers }),
        axios.get("https://localhost:7284/api/Suppliers", { headers })
      ]);
      
      setCategories(catRes.data);
      setSuppliers(supRes.data);
    } catch (err) {
      console.error("Помилка завантаження довідників:", err);
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Універсальна функція для додавання
  const handleAdd = async (type: 'category' | 'supplier', e: React.FormEvent) => {
    e.preventDefault();
    const isCategory = type === 'category';
    const name = isCategory ? newCategoryName : newSupplierName;
    const endpoint = isCategory ? 'Categories' : 'Suppliers';

    if (!name.trim()) return;

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`https://localhost:7284/api/${endpoint}`, { Name: name }, { headers: { Authorization: `Bearer ${token}` } });
      
      if (isCategory) setNewCategoryName("");
      else setNewSupplierName("");
      
      fetchData();
    } catch (err) {
      alert("Помилка при додаванні запису.");
    }
  }

  // Універсальна функція для видалення
  const handleDelete = async (type: 'category' | 'supplier', id: number) => {
    if (!window.confirm("Видалити цей запис?")) return;
    
    const endpoint = type === 'category' ? 'Categories' : 'Suppliers';

    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`https://localhost:7284/api/${endpoint}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message); // Показує нашу захисну помилку з C#
      } else {
        alert("Не вдалося видалити запис.");
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Довідники</h1>
          <p className="text-muted-foreground">Управління категоріями та постачальниками.</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100 transition text-sm">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Оновити
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* БЛОК КАТЕГОРІЙ */}
        <div className="bg-white border rounded-lg shadow-sm flex flex-col h-full">
          <div className="p-4 border-b bg-gray-50 flex items-center gap-2 rounded-t-lg">
            <Folder className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-gray-700">Категорії компонентів</h2>
          </div>
          
          <div className="p-4 border-b">
            <form onSubmit={(e) => handleAdd('category', e)} className="flex gap-2">
              <input 
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Нова категорія..." 
                className="flex-1 border rounded-md px-3 py-2 outline-none focus:border-blue-500 text-sm"
              />
              <button type="submit" disabled={!newCategoryName.trim()} className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition">
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="flex-1 p-0 overflow-y-auto max-h-[500px]">
            {isLoading ? (
              <p className="p-4 text-center text-gray-500 text-sm">Завантаження...</p>
            ) : categories.length === 0 ? (
              <p className="p-4 text-center text-gray-500 text-sm">Список порожній.</p>
            ) : (
              <ul className="divide-y">
                {categories.map(c => (
                  <li key={c.id} className="flex justify-between items-center p-4 hover:bg-gray-50 transition">
                    <span className="font-medium text-sm text-gray-800">{c.name}</span>
                    <button onClick={() => handleDelete('category', c.id)} className="text-gray-400 hover:text-red-600 transition p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* БЛОК ПОСТАЧАЛЬНИКІВ */}
        <div className="bg-white border rounded-lg shadow-sm flex flex-col h-full">
          <div className="p-4 border-b bg-gray-50 flex items-center gap-2 rounded-t-lg">
            <Truck className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold text-gray-700">Постачальники</h2>
          </div>
          
          <div className="p-4 border-b">
            <form onSubmit={(e) => handleAdd('supplier', e)} className="flex gap-2">
              <input 
                type="text" 
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                placeholder="Новий постачальник..." 
                className="flex-1 border rounded-md px-3 py-2 outline-none focus:border-green-500 text-sm"
              />
              <button type="submit" disabled={!newSupplierName.trim()} className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition">
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="flex-1 p-0 overflow-y-auto max-h-[500px]">
            {isLoading ? (
              <p className="p-4 text-center text-gray-500 text-sm">Завантаження...</p>
            ) : suppliers.length === 0 ? (
              <p className="p-4 text-center text-gray-500 text-sm">Список порожній.</p>
            ) : (
              <ul className="divide-y">
                {suppliers.map(s => (
                  <li key={s.id} className="flex justify-between items-center p-4 hover:bg-gray-50 transition">
                    <span className="font-medium text-sm text-gray-800">{s.name}</span>
                    <button onClick={() => handleDelete('supplier', s.id)} className="text-gray-400 hover:text-red-600 transition p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}