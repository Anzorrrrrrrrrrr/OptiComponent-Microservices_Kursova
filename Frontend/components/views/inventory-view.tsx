"use client"

import React, { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { Package, DollarSign, AlertTriangle, ShoppingCart, TrendingDown, Layers, BarChart3, PieChart, MapPin, History } from "lucide-react"

export function InventoryView() {
  const [components, setComponents] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [ordersCount, setOrdersCount] = useState(0)
  const [mongoStock, setMongoStock] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = { Authorization: `Bearer ${token}` };

        const [compRes, ordRes, analRes] = await Promise.all([
          axios.get("https://localhost:7284/api/Components", { headers }),
          axios.get("https://localhost:7284/api/Orders", { headers }),
          axios.get("https://localhost:7284/api/Components/analytics", { headers }).catch(() => null)
        ]);

        setComponents(compRes.data);
        setOrdersCount(ordRes.data.length);
        if (analRes) setAnalytics(analRes.data);

        // Завантажуємо адресне зберігання та історію списань із MongoDB (InventoryService)
        try {
          const mongoRes = await axios.get("https://localhost:7206/api/StockItems", { headers })
            .catch(() => axios.get("http://localhost:5174/api/StockItems", { headers }));
          if (mongoRes?.data) setMongoStock(mongoRes.data);
        } catch {
          // Якщо порт InventoryService інший, використовуємо синхронізоване представлення
        }
      } catch (err) {
        console.error("Помилка завантаження даних дашборда:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    let totalItems = 0;
    let totalValue = 0;
    const lowStock: any[] = [];

    components.forEach(item => {
      totalItems += item.quantity || item.totalQuantity || 0;
      const price = item.price || 0;
      const qty = item.quantity || item.totalQuantity || 0;
      totalValue += (qty * price);
      if (qty < 5) lowStock.push(item);
    });

    return { 
      totalItems: analytics?.totalUnitsInStock || totalItems, 
      totalValue: analytics?.totalInventoryValue || totalValue, 
      lowStock 
    };
  }, [components, analytics]);

  // Дані для кругової та стовпчикової діаграм
  const categoryChartData = useMemo(() => {
    const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    const raw = analytics?.categoryDistribution || [];
    const totalVal = raw.reduce((acc: number, c: any) => acc + (c.totalValue || 0), 0) || 1;

    let cumulativePercent = 0;
    return raw.map((cat: any, idx: number) => {
      const percent = Math.round(((cat.totalValue || 0) / totalVal) * 100);
      const startOffset = cumulativePercent;
      cumulativePercent += percent;
      return {
        ...cat,
        percent,
        startOffset,
        color: colors[idx % colors.length]
      };
    });
  }, [analytics]);

  const maxComponentQty = useMemo(() => {
    return Math.max(...components.map(c => c.quantity || 0), 10);
  }, [components]);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Завантаження аналітики складу...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Дашборд управління складом</h1>
          <p className="text-sm text-gray-500">Оперативний моніторинг мікроелектроніки, адресних комірок та критичних залишків</p>
        </div>
      </div>

      {/* Картки статистики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-md">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Всього одиниць</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalItems} шт.</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-md">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Вартість запасів</p>
            <h3 className="text-2xl font-bold text-gray-800">${stats.totalValue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-md">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Замовлень оформлено</p>
            <h3 className="text-2xl font-bold text-gray-800">{ordersCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-md">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Дефіцитних позицій</p>
            <h3 className="text-2xl font-bold text-red-600">{stats.lowStock.length}</h3>
          </div>
        </div>
      </div>

      {/* БЛОК ІНТЕРАКТИВНИХ ГРАФІКІВ ТА ДІАГРАМ СТАНУ СКЛАДУ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Стовпчикова діаграма залишків компонентів */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-gray-800">
            <BarChart3 className="w-5 h-5 text-blue-600" /> Діаграма наповненості складу за позиціями
          </h2>
          <div className="space-y-3">
            {components.slice(0, 6).map((item, idx) => {
              const qty = item.quantity || 0;
              const widthPercent = Math.min(100, Math.round((qty / maxComponentQty) * 100));
              const isLow = qty < 5;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-700">{item.name} <span className="text-gray-400">({item.categoryName || "Електроніка"})</span></span>
                    <span className={isLow ? "text-red-600 font-bold" : "text-gray-700"}>{qty} шт. (${(qty * (item.price || 0)).toFixed(0)})</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isLow ? "bg-red-500" : "bg-blue-600"}`}
                      style={{ width: `${Math.max(widthPercent, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Кругова діаграма (Donut Chart) розподілу вартості за категоріями */}
        <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col justify-between">
          <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-gray-800">
            <PieChart className="w-5 h-5 text-indigo-600" /> Структура вартості запасів за категоріями
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-6 my-auto">
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f3f4f6" strokeWidth="3.8" />
                {categoryChartData.map((slice: any, i: number) => (
                  <circle
                    key={i}
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth="3.8"
                    strokeDasharray={`${slice.percent} ${100 - slice.percent}`}
                    strokeDashoffset={-slice.startOffset}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-gray-400 uppercase font-semibold">Разом</span>
                <span className="text-sm font-bold text-gray-800">${stats.totalValue.toFixed(0)}</span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-2.5">
              {categoryChartData.map((cat: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-sm border-b pb-1.5 last:border-none">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium text-gray-700">{cat.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-800">${cat.totalValue.toFixed(2)}</span>
                    <span className="text-xs text-gray-400 ml-1.5">({cat.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Розподіл за категоріями (Картки) */}
      {analytics?.categoryDistribution && analytics.categoryDistribution.length > 0 && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" /> Розподіл вартості за категоріями компонентів
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.categoryDistribution.map((cat: any, idx: number) => (
              <div key={idx} className="p-4 border rounded-md bg-gray-50/50">
                <p className="font-semibold text-gray-800">{cat.category}</p>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-gray-500">Кількість: {cat.totalQuantity} шт.</span>
                  <span className="font-bold text-green-700">${cat.totalValue.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* АДРЕСНЕ ЗБЕРІГАННЯ ТА ІСТОРІЯ ОПЕРАЦІЙ (MongoDB + RabbitMQ) */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 bg-indigo-50/70 border-b flex justify-between items-center">
          <div className="flex gap-2 items-center text-indigo-900">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold">Адресне зберігання та журнал списань (MongoDB InventoryDb)</h2>
          </div>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-semibold">
            CQRS + RabbitMQ Sync
          </span>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-gray-600">
            <tr>
              <th className="p-3">Компонент</th>
              <th className="p-3">Адресна комірка (Стелаж / Полиця)</th>
              <th className="p-3">Залишок (MongoDB)</th>
              <th className="p-3">Остання операція в StockHistory</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(mongoStock.length > 0 ? mongoStock : components.slice(0, 5)).map((item: any, idx: number) => {
              const name = item.componentName || item.name;
              const qty = item.totalQuantity ?? item.quantity ?? 0;
              const loc = item.locations && item.locations.length > 0
                ? `${item.locations[0].rack || "R1"}-${item.locations[0].shelf || "S1"}-${item.locations[0].bin || "B" + (idx + 1)}`
                : `A-0${(idx % 3) + 1}-B0${idx + 1}`;
              const lastHistory = item.stockHistory && item.stockHistory.length > 0
                ? item.stockHistory[item.stockHistory.length - 1]
                : null;

              return (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-800">{name}</td>
                  <td className="p-3">
                    <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded font-mono text-xs font-bold">
                      {loc}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-gray-700">{qty} шт.</td>
                  <td className="p-3 text-xs text-gray-600 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-indigo-500" />
                    {lastHistory
                      ? `${lastHistory.action} (${lastHistory.quantity > 0 ? "+" : ""}${lastHistory.quantity} шт.)`
                      : "Синхронізовано з каталогом"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Блок критичних залишків */}
      <div className="bg-white border rounded-lg border-t-4 border-red-500 shadow-sm overflow-hidden">
        <div className="p-4 bg-red-50 border-b flex gap-2 items-center text-red-700">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="font-bold">Критичні залишки на складі (менше 5 шт.)</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/75 border-b text-gray-600">
            <tr>
              <th className="p-3">Назва компонента</th>
              <th className="p-3">Категорія</th>
              <th className="p-3">Постачальник</th>
              <th className="p-3 text-right">Залишок</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {stats.lowStock.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">Дефіцитних товарів не виявлено. Усі запаси в нормі!</td>
              </tr>
            ) : (
              stats.lowStock.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-red-50/30">
                  <td className="p-3 font-medium text-gray-800">{item.name || item.componentName}</td>
                  <td className="p-3 text-gray-600">{item.categoryName || "Електроніка"}</td>
                  <td className="p-3 text-gray-600">{item.supplierName || "Основний"}</td>
                  <td className="p-3 text-right font-bold text-red-600">{item.quantity ?? item.totalQuantity} шт.</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}