"use client"

import React, { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { Plus, Pencil, Trash2, RefreshCw, X, Search, Package, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

interface ComponentDto {
  id: number;
  name: string;
  price: number;
  quantity: number;
  categoryName?: string; 
  supplierName?: string; 
  categoryId?: number;
  supplierId?: number;
}

interface DropdownItem {
  id: number;
  name: string;
}

export function CatalogView() {
  const [components, setComponents] = useState<ComponentDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [categories, setCategories] = useState<DropdownItem[]>([])
  const [suppliers, setSuppliers] = useState<DropdownItem[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [newName, setNewName] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [newQuantity, setNewQuantity] = useState("0")
  const [newCategoryId, setNewCategoryId] = useState("") 
  const [newSupplierId, setNewSupplierId] = useState("")

  const [searchTerm, setSearchTerm] = useState("")

  // === НОВІ СТАНИ ДЛЯ СОРТУВАННЯ ТА ПАГІНАЦІЇ ===
  const [sortConfig, setSortConfig] = useState<{ key: keyof ComponentDto, direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Кількість елементів на одній сторінці

  const fetchComponents = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("authToken");
      let url = "https://localhost:7284/api/Components";
      if (searchTerm.trim() !== "") {
        url = `https://localhost:7284/api/Components/filter?name=${encodeURIComponent(searchTerm)}`;
      }
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      setComponents(response.data)
      setCurrentPage(1); // Скидаємо на першу сторінку при новому завантаженні
    } catch (err) {
      console.error("Помилка завантаження:", err)
      setError("Не вдалося завантажити дані.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDropdownData = async () => {
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
    }
  }

  const handleOpenAdd = () => {
    setEditingId(null);
    setNewName("");
    setNewPrice("");
    setNewQuantity("0");
    setNewCategoryId("");
    setNewSupplierId("");
    setIsModalOpen(true);
  }

  const handleOpenEdit = (item: ComponentDto) => {
    setEditingId(item.id);
    setNewName(item.name);
    setNewPrice(item.price.toString());
    setNewQuantity(item.quantity ? item.quantity.toString() : "0");
    setNewCategoryId(item.categoryId ? item.categoryId.toString() : "");
    setNewSupplierId(item.supplierId ? item.supplierId.toString() : "");
    setIsModalOpen(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() 
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("authToken");
      const selectedCategory = categories.find(c => c.id.toString() === newCategoryId);
      const selectedSupplier = suppliers.find(s => s.id.toString() === newSupplierId);
      
      const payload = {
        Name: newName,
        Price: parseFloat(newPrice),
        Quantity: parseInt(newQuantity || "0", 10),
        CategoryId: parseInt(newCategoryId),
        SupplierId: parseInt(newSupplierId),
        CategoryName: selectedCategory ? selectedCategory.name : "Невідомо", 
        SupplierName: selectedSupplier ? selectedSupplier.name : "Невідомо"
      };

      if (editingId) {
        await axios.put(`https://localhost:7284/api/Components/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post("https://localhost:7284/api/Components", payload, { headers: { Authorization: `Bearer ${token}` } });
      }

      setIsModalOpen(false)
      fetchComponents() 
    } catch (err: any) {
      console.error("Помилка при збереженні:", err)
      alert("Не вдалося зберегти компонент. Перевірте консоль (F12).");
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComponent = async (id: number) => {
    if (!window.confirm("Ви дійсно хочете видалити цей компонент?")) return; 
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`https://localhost:7284/api/Components/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchComponents(); 
    } catch (err: any) {
      console.error("Помилка при видаленні:", err);
      alert("Не вдалося видалити компонент.");
    }
  }

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchComponents();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // === ЛОГІКА СОРТУВАННЯ ===
  const handleSort = (key: keyof ComponentDto) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Мемоізація: React перераховує це тільки тоді, коли змінюються дані або правила сортування
  const sortedComponents = useMemo(() => {
    let sortableItems = [...components];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key] ?? "";
        let bValue = b[sortConfig.key] ?? "";

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [components, sortConfig]);

  // === ЛОГІКА ПАГІНАЦІЇ ===
  const totalPages = Math.ceil(sortedComponents.length / itemsPerPage);
  const paginatedComponents = sortedComponents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Компонент-помічник для заголовків таблиці (щоб не дублювати код)
  const SortableHeader = ({ label, sortKey }: { label: string, sortKey: keyof ComponentDto }) => (
    <th 
      className="p-4 font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition select-none"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortConfig?.key === sortKey ? (
          sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-transparent group-hover:text-gray-300" /> // Невидима іконка для вирівнювання
        )}
      </div>
    </th>
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Каталог компонентів</h1>
          <p className="text-muted-foreground">Управління мікроелектронікою на складі.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Шукати за назвою..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 border rounded-md outline-none focus:border-blue-500 text-sm transition-all"
            />
          </div>

          <button onClick={fetchComponents} className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100 transition text-sm">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Оновити</span>
          </button>
          <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm whitespace-nowrap">
            <Plus className="w-4 h-4" />
            Додати
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-md border border-red-200">{error}</div>}

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b">
              <tr>
                <SortableHeader label="ID" sortKey="id" />
                <SortableHeader label="Назва" sortKey="name" />
                <SortableHeader label="Категорія" sortKey="categoryName" />
                <SortableHeader label="Постачальник" sortKey="supplierName" />
                <SortableHeader label="Ціна" sortKey="price" />
                <SortableHeader label="К-сть" sortKey="quantity" />
                <th className="p-4 font-medium text-gray-500 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Завантаження...</td></tr>
              ) : paginatedComponents.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">
                  {searchTerm ? `За запитом "${searchTerm}" нічого не знайдено.` : "Компонентів не знайдено."}
                </td></tr>
              ) : (
                paginatedComponents.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">{item.id}</td>
                    <td className="p-4 font-medium">{item.name}</td>
                    <td className="p-4">{item.categoryName || '—'}</td>
                    <td className="p-4">{item.supplierName || '—'}</td>
                    <td className="p-4 text-green-700 font-medium">${item.price.toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Package className={`w-4 h-4 ${item.quantity > 0 ? 'text-blue-500' : 'text-red-400'}`} />
                        {item.quantity || 0} шт.
                      </div>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleOpenEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteComponent(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* НОВИЙ БЛОК: ПАГІНАЦІЯ ВНИЗУ ТАБЛИЦІ */}
        {!isLoading && totalPages > 1 && (
          <div className="bg-gray-50 p-4 border-t flex items-center justify-between text-sm text-gray-500">
            <div>
              Показано {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedComponents.length)} з {sortedComponents.length} елементів
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                    currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* МОДАЛКА ЗАЛИШИЛАСЯ БЕЗ ЗМІН */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingId ? "Редагувати компонент" : "Новий компонент"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Назва</label>
                <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full border rounded-md px-3 py-2 outline-none focus:border-blue-500" placeholder="Введіть назву..." />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ціна ($)</label>
                  <input type="number" required step="0.01" min="0" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full border rounded-md px-3 py-2 outline-none focus:border-blue-500" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">На складі (шт.)</label>
                  <input type="number" required min="0" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} className="w-full border rounded-md px-3 py-2 outline-none focus:border-blue-500" placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Категорія</label>
                  <select required value={newCategoryId} onChange={(e) => setNewCategoryId(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-white outline-none focus:border-blue-500 cursor-pointer">
                    <option value="" disabled>Оберіть...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Постачальник</label>
                  <select required value={newSupplierId} onChange={(e) => setNewSupplierId(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-white outline-none focus:border-blue-500 cursor-pointer">
                    <option value="" disabled>Оберіть...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50 transition">Скасувати</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50">
                  {isSubmitting ? "Збереження..." : "Зберегти"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}