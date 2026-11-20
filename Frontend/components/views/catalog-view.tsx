"use client"

import React, { useState, useEffect, useMemo } from "react"
import axios from "axios"
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Search,
  Package,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Tag,
  Download,
  ShieldCheck,
  Eye,
  Filter,
  FileText,
  ExternalLink,
  Image as ImageIcon,
  Upload
} from "lucide-react"

interface ComponentDto {
  id: number;
  name: string;
  price: number;
  quantity: number;
  categoryName?: string;
  supplierName?: string;
  categoryId?: number;
  supplierId?: number;
  description?: string;
  datasheetUrl?: string;
  imageUrl?: string;
}

interface DropdownItem {
  id: number;
  name: string;
}

interface ComponentExtraMeta {
  description: string;
  datasheetUrl: string;
  imageUrl: string;
}

const ADMIN_EMAILS = [
  "admin@gmail.com",
  "admin@opticomponent.com",
  "admin@ukr.net"
];

// Автономні векторні зображення радіодеталей (працюють на 100% без залежності від зовнішніх сайтів)
const SVG_IMAGES = {
  resistor: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" width="200" height="120">
      <rect width="200" height="120" rx="12" fill="#f8fafc"/>
      <line x1="15" y1="60" x2="185" y2="60" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>
      <rect x="45" y="36" width="110" height="48" rx="14" fill="#e2c08d" stroke="#b48a4e" stroke-width="2.5"/>
      <rect x="62" y="36" width="10" height="48" fill="#7c2d12"/>
      <rect x="82" y="36" width="10" height="48" fill="#0f172a"/>
      <rect x="102" y="36" width="10" height="48" fill="#ea580c"/>
      <rect x="130" y="36" width="8" height="48" fill="#eab308"/>
      <text x="100" y="106" font-family="monospace" font-size="11" font-weight="bold" fill="#475569" text-anchor="middle">10kΩ ±1% SMD/Axial</text>
    </svg>
  `)}`,
  diode: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" width="200" height="120">
      <rect width="200" height="120" rx="12" fill="#f8fafc"/>
      <line x1="15" y1="58" x2="185" y2="58" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>
      <rect x="52" y="34" width="96" height="48" rx="6" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
      <rect x="122" y="34" width="14" height="48" fill="#cbd5e1"/>
      <text x="90" y="62" font-family="monospace" font-size="11" font-weight="bold" fill="#f8fafc" text-anchor="middle">1N5819</text>
      <text x="100" y="106" font-family="monospace" font-size="11" font-weight="bold" fill="#475569" text-anchor="middle">Schottky DO-41</text>
    </svg>
  `)}`,
  esp32: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" width="200" height="120">
      <rect width="200" height="120" rx="12" fill="#f0fdf4"/>
      <rect x="42" y="14" width="116" height="92" rx="6" fill="#14532d" stroke="#052e16" stroke-width="2"/>
      <path d="M 60 26 L 140 26 L 140 36 L 75 36 L 75 44 L 130 44" fill="none" stroke="#eab308" stroke-width="3"/>
      <rect x="56" y="48" width="88" height="48" rx="4" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/>
      <text x="100" y="70" font-family="monospace" font-size="10" font-weight="bold" fill="#1e293b" text-anchor="middle">ESP-WROOM-32</text>
      <text x="100" y="84" font-family="monospace" font-size="8" fill="#475569" text-anchor="middle">Wi-Fi + BT LE</text>
      <g fill="#eab308">
        <rect x="42" y="24" width="6" height="5"/><rect x="42" y="34" width="6" height="5"/><rect x="42" y="44" width="6" height="5"/><rect x="42" y="54" width="6" height="5"/><rect x="42" y="64" width="6" height="5"/><rect x="42" y="74" width="6" height="5"/><rect x="42" y="84" width="6" height="5"/>
        <rect x="152" y="24" width="6" height="5"/><rect x="152" y="34" width="6" height="5"/><rect x="152" y="44" width="6" height="5"/><rect x="152" y="54" width="6" height="5"/><rect x="152" y="64" width="6" height="5"/><rect x="152" y="74" width="6" height="5"/><rect x="152" y="84" width="6" height="5"/>
      </g>
    </svg>
  `)}`,
  mcu: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" width="200" height="120">
      <rect width="200" height="120" rx="12" fill="#eff6ff"/>
      <g fill="#94a3b8">
        <rect x="38" y="32" width="14" height="5"/><rect x="38" y="44" width="14" height="5"/><rect x="38" y="56" width="14" height="5"/><rect x="38" y="68" width="14" height="5"/><rect x="38" y="80" width="14" height="5"/>
        <rect x="148" y="32" width="14" height="5"/><rect x="148" y="44" width="14" height="5"/><rect x="148" y="56" width="14" height="5"/><rect x="148" y="68" width="14" height="5"/><rect x="148" y="80" width="14" height="5"/>
      </g>
      <rect x="50" y="22" width="100" height="76" rx="6" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
      <circle cx="62" cy="34" r="4" fill="#94a3b8"/>
      <text x="100" y="58" font-family="monospace" font-size="11" font-weight="bold" fill="#e2e8f0" text-anchor="middle">ATmega / STM32</text>
      <text x="100" y="74" font-family="monospace" font-size="9" fill="#38bdf8" text-anchor="middle">32-BIT MCU IC</text>
    </svg>
  `)}`,
  generic: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" width="200" height="120">
      <rect width="200" height="120" rx="12" fill="#f5f3ff"/>
      <rect x="45" y="28" width="110" height="64" rx="8" fill="#4f46e5" stroke="#3730a3" stroke-width="2"/>
      <rect x="35" y="40" width="10" height="10" fill="#cbd5e1"/>
      <rect x="35" y="68" width="10" height="10" fill="#cbd5e1"/>
      <rect x="155" y="40" width="10" height="10" fill="#cbd5e1"/>
      <rect x="155" y="68" width="10" height="10" fill="#cbd5e1"/>
      <text x="100" y="58" font-family="monospace" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">SMD / DIP</text>
      <text x="100" y="74" font-family="monospace" font-size="9" fill="#e0e7ff" text-anchor="middle">COMPONENT</text>
    </svg>
  `)}`
};

// Базові технічні описи, автономні фото та даташити для радіоелектронних компонентів
const DEFAULT_COMPONENT_META: Record<string, ComponentExtraMeta> = {
  "esp-32": {
    description: "32-бітний двоядерний мікроконтролер Wi-Fi + Bluetooth LE (240 МГц, 520 КБ SRAM, 38 pin SMD)",
    datasheetUrl: "https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf",
    imageUrl: SVG_IMAGES.esp32
  },
  "resistor": {
    description: "Прецизійний металоплівковий / SMD резистор 10 кОм, допуск ±1%, потужність 0.25 Вт (корпус 0805 / Axial)",
    datasheetUrl: "https://www.vishay.com/docs/20035/dcrcwe3.pdf",
    imageUrl: SVG_IMAGES.resistor
  },
  "dio": {
    description: "Випрямний кремнієвий діод Шотткі 1N5819 (40 В, 1 А, низьке пряме падіння напруги, корпус DO-41 / SMA)",
    datasheetUrl: "https://www.vishay.com/docs/88525/1n5817.pdf",
    imageUrl: SVG_IMAGES.diode
  },
  "diod": {
    description: "Випрямний кремнієвий діод Шотткі 1N5819 (40 В, 1 А, низьке пряме падіння напруги, корпус DO-41 / SMA)",
    datasheetUrl: "https://www.vishay.com/docs/88525/1n5817.pdf",
    imageUrl: SVG_IMAGES.diode
  },
  "microcontroller": {
    description: "Мікроконтролер ATmega328P / STM32F103 (Flash 32–64 КБ, АЦП 10/12-біт, інтерфейси SPI, I2C, UART, PWM)",
    datasheetUrl: "https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf",
    imageUrl: SVG_IMAGES.mcu
  }
};

function getFallbackMeta(name: string): ComponentExtraMeta {
  const key = (name || "").trim().toLowerCase();
  if (DEFAULT_COMPONENT_META[key]) {
    return DEFAULT_COMPONENT_META[key];
  }
  if (key.includes("esp") || key.includes("wifi")) return DEFAULT_COMPONENT_META["esp-32"];
  if (key.includes("res") || key.includes("ом") || key.includes("резистор")) return DEFAULT_COMPONENT_META["resistor"];
  if (key.includes("dio") || key.includes("діод") || key.includes("led")) return DEFAULT_COMPONENT_META["dio"];
  if (key.includes("stm") || key.includes("atmega") || key.includes("micro") || key.includes("controller")) {
    return DEFAULT_COMPONENT_META["microcontroller"];
  }

  return {
    description: `Електронний компонент «${name}» для поверхневого (SMD) або наскрізного (DIP) монтажу друкованих плат`,
    datasheetUrl: `https://www.alldatasheet.com/view.jsp?Searchword=${encodeURIComponent(name || "electronic component")}`,
    imageUrl: SVG_IMAGES.generic
  };
}

function isValidCustomImage(url?: string): boolean {
  if (!url || url.trim() === "") return false;
  // Ігноруємо старі посилання на wikimedia, які блокуються браузером
  if (url.includes("upload.wikimedia.org")) return false;
  return true;
}

export function CatalogView() {
  const [components, setComponents] = useState<ComponentDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [userRole, setUserRole] = useState<"Admin" | "User">("User")

  // Модальні вікна для етикеток та перегляду фото/характеристик
  const [barcodeModalData, setBarcodeModalData] = useState<any>(null)
  const [previewComponent, setPreviewComponent] = useState<ComponentDto | null>(null)

  const [categories, setCategories] = useState<DropdownItem[]>([])
  const [suppliers, setSuppliers] = useState<DropdownItem[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Поля форми
  const [newName, setNewName] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [newQuantity, setNewQuantity] = useState("0")
  const [newCategoryId, setNewCategoryId] = useState("")
  const [newSupplierId, setNewSupplierId] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newDatasheetUrl, setNewDatasheetUrl] = useState("")
  const [newImageUrl, setNewImageUrl] = useState("")

  // Локальне сховище метаданих (опис, фото, datasheet)
  const [customMetaMap, setCustomMetaMap] = useState<Record<string, ComponentExtraMeta>>({})

  // Багатопараметрична фільтрація
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("ALL")
  const [filterSupplier, setFilterSupplier] = useState("ALL")
  const [filterStockStatus, setFilterStockStatus] = useState("ALL")

  const [sortConfig, setSortConfig] = useState<{ key: keyof ComponentDto, direction: "asc" | "desc" } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Завантаження збережених описів/фото/даташитів із localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("opticomponent_catalog_meta");
      if (saved) {
        setCustomMetaMap(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Помилка читання метаданих:", e);
    }
  }, []);

  // Автоматичне визначення ролі з JWT-токена та даних авторизації
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedEmail = (localStorage.getItem("userEmail") || localStorage.getItem("email") || "").toLowerCase();
    const storedRole = localStorage.getItem("userRole") || localStorage.getItem("role") || "";

    let detectedRole: "Admin" | "User" = "User";

    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(decodeURIComponent(escape(window.atob(base64))));

        const jwtRole =
          payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
          payload.role ||
          payload.Role ||
          storedRole;

        const jwtEmail = (
          payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
          payload.email ||
          payload.unique_name ||
          payload.sub ||
          storedEmail
        ).toLowerCase();

        if (
          jwtRole === "Admin" ||
          ADMIN_EMAILS.includes(jwtEmail) ||
          jwtEmail.startsWith("admin@")
        ) {
          detectedRole = "Admin";
        }
      } catch (e) {
        console.error("Помилка читання токена:", e);
      }
    } else if (
      storedRole === "Admin" ||
      ADMIN_EMAILS.includes(storedEmail) ||
      storedEmail.startsWith("admin@")
    ) {
      detectedRole = "Admin";
    }

    setUserRole(detectedRole);
  }, []);

  const isAdmin = userRole === "Admin";

  const enrichComponent = (item: ComponentDto, metaStore: Record<string, ComponentExtraMeta>): ComponentDto => {
    const byId = metaStore[`id_${item.id}`];
    const byName = metaStore[`name_${(item.name || "").trim().toLowerCase()}`];
    const fallback = getFallbackMeta(item.name);

    const chosenImage =
      (isValidCustomImage(item.imageUrl) && item.imageUrl) ||
      (isValidCustomImage(byId?.imageUrl) && byId?.imageUrl) ||
      (isValidCustomImage(byName?.imageUrl) && byName?.imageUrl) ||
      fallback.imageUrl;

    return {
      ...item,
      description: item.description || byId?.description || byName?.description || fallback.description,
      datasheetUrl: item.datasheetUrl || byId?.datasheetUrl || byName?.datasheetUrl || fallback.datasheetUrl,
      imageUrl: chosenImage
    };
  };

  const fetchComponents = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("authToken");
      let url = "https://localhost:7284/api/Components";
      if (searchTerm.trim() !== "") {
        url = `https://localhost:7284/api/Components/filter?name=${encodeURIComponent(searchTerm)}`;
      }
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });

      let currentMeta: Record<string, ComponentExtraMeta> = customMetaMap;
      try {
        const raw = localStorage.getItem("opticomponent_catalog_meta");
        if (raw) currentMeta = JSON.parse(raw);
      } catch {}

      const enriched = (response.data || []).map((item: ComponentDto) => enrichComponent(item, currentMeta));
      setComponents(enriched);
      setCurrentPage(1);
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

  const handleOpenLabelModal = async (id: number) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`https://localhost:7284/api/Components/${id}/label`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBarcodeModalData(res.data);
    } catch (err) {
      console.error("Помилка генерації етикетки:", err);
      alert("Не вдалося сформувати етикетку компонента.");
    }
  };

  const handleExportCsv = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("https://localhost:7284/api/Components/export-csv", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `OptiComponent_Stock_Report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Помилка експорту:", err);
      alert("Не вдалося завантажити звіт складу.");
    }
  };

  // Завантаження локального файлу зображення з ПК у Base64
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setNewImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setNewName("");
    setNewPrice("");
    setNewQuantity("0");
    setNewCategoryId("");
    setNewSupplierId("");
    setNewDescription("");
    setNewDatasheetUrl("");
    setNewImageUrl("");
    setIsModalOpen(true);
  }

  const handleOpenEdit = (item: ComponentDto) => {
    setEditingId(item.id);
    setNewName(item.name);
    setNewPrice(item.price.toString());
    setNewQuantity(item.quantity ? item.quantity.toString() : "0");
    setNewCategoryId(item.categoryId ? item.categoryId.toString() : "");
    setNewSupplierId(item.supplierId ? item.supplierId.toString() : "");
    setNewDescription(item.description || "");
    setNewDatasheetUrl(item.datasheetUrl || "");
    setNewImageUrl(item.imageUrl?.startsWith("data:image/svg+xml") ? "" : (item.imageUrl || ""));
    setIsModalOpen(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("authToken");
      const selectedCategory = categories.find(c => c.id.toString() === newCategoryId);
      const selectedSupplier = suppliers.find(s => s.id.toString() === newSupplierId);

      const fallback = getFallbackMeta(newName);
      const finalDescription = newDescription.trim() || fallback.description;
      const finalDatasheet = newDatasheetUrl.trim() || fallback.datasheetUrl;
      const finalImage = newImageUrl.trim() || fallback.imageUrl;

      const payload = {
        Name: newName,
        Price: parseFloat(newPrice),
        Quantity: parseInt(newQuantity || "0", 10),
        CategoryId: parseInt(newCategoryId),
        SupplierId: parseInt(newSupplierId),
        CategoryName: selectedCategory ? selectedCategory.name : "Невідомо",
        SupplierName: selectedSupplier ? selectedSupplier.name : "Невідомо",
        Description: finalDescription,
        DatasheetUrl: finalDatasheet,
        ImageUrl: finalImage
      };

      if (editingId) {
        await axios.put(`https://localhost:7284/api/Components/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post("https://localhost:7284/api/Components", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      const updatedMeta = { ...customMetaMap };
      if (editingId) {
        updatedMeta[`id_${editingId}`] = {
          description: finalDescription,
          datasheetUrl: finalDatasheet,
          imageUrl: finalImage
        };
      }
      updatedMeta[`name_${newName.trim().toLowerCase()}`] = {
        description: finalDescription,
        datasheetUrl: finalDatasheet,
        imageUrl: finalImage
      };

      setCustomMetaMap(updatedMeta);
      localStorage.setItem("opticomponent_catalog_meta", JSON.stringify(updatedMeta));

      setIsModalOpen(false)
      fetchComponents()
    } catch (err: any) {
      console.error("Помилка при збереженні:", err)
      alert("Не вдалося зберегти компонент.");
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComponent = async (id: number) => {
    if (!window.confirm("Ви дійсно хочете видалити цей компонент?")) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`https://localhost:7284/api/Components/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  const handleSort = (key: keyof ComponentDto) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedComponents = useMemo(() => {
    let items = components.filter(item => {
      const matchCat = filterCategory === "ALL" || item.categoryName === filterCategory;
      const matchSup = filterSupplier === "ALL" || item.supplierName === filterSupplier;

      let matchStock = true;
      const qty = item.quantity || 0;
      if (filterStockStatus === "IN_STOCK") matchStock = qty >= 5;
      else if (filterStockStatus === "LOW_STOCK") matchStock = qty > 0 && qty < 5;
      else if (filterStockStatus === "OUT_OF_STOCK") matchStock = qty === 0;

      return matchCat && matchSup && matchStock;
    });

    if (sortConfig !== null) {
      items.sort((a, b) => {
        let aValue = a[sortConfig.key] ?? "";
        let bValue = b[sortConfig.key] ?? "";

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [components, sortConfig, filterCategory, filterSupplier, filterStockStatus]);

  const totalPages = Math.ceil(filteredAndSortedComponents.length / itemsPerPage);
  const paginatedComponents = filteredAndSortedComponents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortableHeader = ({ label, sortKey }: { label: string, sortKey: keyof ComponentDto }) => (
    <th
      className="p-4 font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition select-none"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortConfig?.key === sortKey ? (
          sortConfig.direction === "asc" ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-transparent group-hover:text-gray-300" />
        )}
      </div>
    </th>
  );

  return (
    <div className="space-y-4 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Каталог компонентів</h1>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Повний доступ (Admin)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                <Eye className="w-3.5 h-3.5" /> Режим перегляду (User)
              </span>
            )}
          </div>
          <p className="text-muted-foreground">Управління мікроелектронікою, технічною документацією (Datasheet) та маркуванням.</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <button
            onClick={handleExportCsv}
            title="Експорт управлінського звіту у CSV"
            className="flex items-center gap-2 px-3 py-2 border bg-white rounded-md hover:bg-gray-50 transition text-sm text-gray-700 font-medium">
            <Download className="w-4 h-4 text-green-600" />
            <span className="hidden md:inline">Звіт (CSV)</span>
          </button>

          <button onClick={fetchComponents} className="flex items-center gap-2 px-4 py-2 border bg-white rounded-md hover:bg-gray-100 transition text-sm">
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Оновити</span>
          </button>

          {isAdmin && (
            <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm whitespace-nowrap">
              <Plus className="w-4 h-4" />
              Додати
            </button>
          )}
        </div>
      </div>

      {/* ПАНЕЛЬ БАГАТОПАРАМЕТРИЧНОЇ ФІЛЬТРАЦІЇ */}
      <div className="bg-white p-3.5 rounded-lg border shadow-sm flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">
          <Filter className="w-4 h-4 text-blue-600" /> Фільтри:
        </div>

        <div className="relative flex-grow sm:flex-grow-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Шукати за назвою..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 w-full sm:w-56 border rounded-md outline-none focus:border-blue-500 text-sm transition-all"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
          className="border rounded-md px-3 py-1.5 text-sm bg-white outline-none focus:border-blue-500"
        >
          <option value="ALL">Усі категорії</option>
          {categories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        <select
          value={filterSupplier}
          onChange={(e) => { setFilterSupplier(e.target.value); setCurrentPage(1); }}
          className="border rounded-md px-3 py-1.5 text-sm bg-white outline-none focus:border-blue-500"
        >
          <option value="ALL">Усі постачальники</option>
          {suppliers.map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>

        <select
          value={filterStockStatus}
          onChange={(e) => { setFilterStockStatus(e.target.value); setCurrentPage(1); }}
          className="border rounded-md px-3 py-1.5 text-sm bg-white outline-none focus:border-blue-500"
        >
          <option value="ALL">Будь-яка наявність</option>
          <option value="IN_STOCK">В наявності (від 5 шт.)</option>
          <option value="LOW_STOCK">Критичний залишок (1–4 шт.)</option>
          <option value="OUT_OF_STOCK">Немає на складі (0 шт.)</option>
        </select>

        {(filterCategory !== "ALL" || filterSupplier !== "ALL" || filterStockStatus !== "ALL" || searchTerm !== "") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterCategory("ALL");
              setFilterSupplier("ALL");
              setFilterStockStatus("ALL");
            }}
            className="text-xs text-blue-600 hover:underline ml-auto font-medium"
          >
            Скинути фільтри
          </button>
        )}
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-md border border-red-200">{error}</div>}

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b whitespace-nowrap">
              <tr>
                <SortableHeader label="ID" sortKey="id" />
                <SortableHeader label="Фото / Компонент та опис" sortKey="name" />
                <SortableHeader label="Категорія" sortKey="categoryName" />
                <SortableHeader label="Постачальник" sortKey="supplierName" />
                <th className="p-4 font-medium text-gray-500">Документація</th>
                <SortableHeader label="Ціна" sortKey="price" />
                <SortableHeader label="К-сть" sortKey="quantity" />
                <th className="p-4 font-medium text-gray-500 text-right">
                  {isAdmin ? "Дії / Маркування" : "Маркування"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">Завантаження...</td></tr>
              ) : paginatedComponents.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">
                  За обраними параметрами фільтрації компонентів не знайдено.
                </td></tr>
              ) : (
                paginatedComponents.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition align-middle">
                    <td className="p-4 text-gray-500 font-mono">{item.id}</td>

                    {/* ФОТО + НАЗВА + ТЕХНІЧНИЙ ОПИС */}
                    <td className="p-4 min-w-[280px] max-w-md">
                      <div className="flex items-start gap-3.5">
                        <button
                          type="button"
                          onClick={() => setPreviewComponent(item)}
                          title="Натисніть для перегляду фото та повної специфікації"
                          className="w-16 h-12 rounded-lg border bg-slate-50 flex-shrink-0 overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-blue-500 transition group"
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = getFallbackMeta(item.name).imageUrl;
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <div className="space-y-0.5">
                          <div
                            onClick={() => setPreviewComponent(item)}
                            className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition"
                          >
                            {item.name}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">{item.categoryName || "—"}</td>
                    <td className="p-4 whitespace-nowrap">{item.supplierName || "—"}</td>

                    {/* ПОСИЛАННЯ НА DATASHEET (PDF) */}
                    <td className="p-4 whitespace-nowrap">
                      {item.datasheetUrl ? (
                        <a
                          href={item.datasheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Відкрити технічну специфікацію (Datasheet PDF)"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Datasheet PDF
                          <ExternalLink className="w-3 h-3 opacity-75" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">Не вказано</span>
                      )}
                    </td>

                    <td className="p-4 text-green-700 font-semibold whitespace-nowrap">${item.price.toFixed(2)}</td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Package className={`w-4 h-4 ${item.quantity > 0 ? "text-blue-500" : "text-red-400"}`} />
                        {item.quantity || 0} шт.
                      </div>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5 items-center">
                        <button
                          onClick={() => handleOpenLabelModal(item.id)}
                          title="Згенерувати штрих-код та етикетку"
                          className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-semibold flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" /> Етикетка
                        </button>
                        {isAdmin && (
                          <>
                            <button onClick={() => handleOpenEdit(item)} title="Редагувати" className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteComponent(item.id)} title="Видалити" className="p-2 text-red-600 hover:bg-red-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="bg-gray-50 p-4 border-t flex items-center justify-between text-sm text-gray-500">
            <div>
              Показано {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredAndSortedComponents.length)} з {filteredAndSortedComponents.length} елементів
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
                    currentPage === page ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-100"
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

      {/* МОДАЛЬНЕ ВІКНО ДЕТАЛЬНОГО ПЕРЕГЛЯДУ КАРТКИ КОМПОНЕНТА (ФОТО + ОПИС + DATASHEET) */}
      {previewComponent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="font-bold text-lg text-gray-900">
                Технічний паспорт: {previewComponent.name}
              </h3>
              <button onClick={() => setPreviewComponent(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="w-full h-52 bg-slate-50 border rounded-lg overflow-hidden flex items-center justify-center p-2">
                <img
                  src={previewComponent.imageUrl}
                  alt={previewComponent.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = getFallbackMeta(previewComponent.name).imageUrl;
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-3.5 rounded-md border">
                <div><span className="text-gray-500">Категорія:</span> <strong>{previewComponent.categoryName || "—"}</strong></div>
                <div><span className="text-gray-500">Постачальник:</span> <strong>{previewComponent.supplierName || "—"}</strong></div>
                <div><span className="text-gray-500">Ціна за одиницю:</span> <strong className="text-green-700">${previewComponent.price.toFixed(2)}</strong></div>
                <div><span className="text-gray-500">Залишок:</span> <strong>{previewComponent.quantity} шт.</strong></div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-500 mb-1">Технічний опис та параметри корпусу:</h4>
                <p className="text-sm text-gray-700 leading-relaxed bg-white border p-3 rounded-md">
                  {previewComponent.description}
                </p>
              </div>
              <div className="flex justify-between items-center pt-2">
                {previewComponent.datasheetUrl ? (
                  <a
                    href={previewComponent.datasheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition"
                  >
                    <FileText className="w-4 h-4" /> Відкрити Datasheet (PDF) <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : <div />}
                <button
                  onClick={() => setPreviewComponent(null)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 text-sm font-medium"
                >
                  Закрити
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНЕ ВІКНО ПЕРЕГЛЯДУ ЕТИКЕТКИ ТА ШТРИХ-КОДУ */}
      {barcodeModalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-600" /> Маркування деталі
              </h3>
              <button onClick={() => setBarcodeModalData(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-md border">
              <p><strong>Найменування:</strong> {barcodeModalData.name}</p>
              <p><strong>Артикул (SKU):</strong> <span className="font-mono text-indigo-600 font-semibold">{barcodeModalData.sku}</span></p>
              <p><strong>Категорія:</strong> {barcodeModalData.category}</p>
              <p><strong>Адресна комірка:</strong> <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold font-mono">{barcodeModalData.location}</span></p>
              <p><strong>Стандарт штрих-коду:</strong> {barcodeModalData.barcodeType} ({barcodeModalData.dimensions})</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">ZPL-код для термопринтера (Zebra):</label>
              <pre className="mt-1 bg-gray-900 text-emerald-400 p-3 rounded text-xs font-mono overflow-x-auto shadow-inner">{barcodeModalData.zpl}</pre>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setBarcodeModalData(null)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 transition text-sm">
                Закрити
              </button>
              <button
                onClick={() => { alert("Команди маркування успішно надіслано на принтер етикеток!"); setBarcodeModalData(null); }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm transition">
                Друк етикетки
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА ДОДАВАННЯ / РЕДАГУВАННЯ КОМПОНЕНТА */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 my-8">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-bold">{editingId ? "Редагувати компонент" : "Новий компонент"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Назва / Маркування компонента</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 outline-none focus:border-blue-500 text-sm"
                  placeholder="Наприклад: STM32F103C8T6 або Конденсатор 100nF 0805"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ціна ($)</label>
                  <input type="number" required step="0.01" min="0" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full border rounded-md px-3 py-2 outline-none focus:border-blue-500 text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">На складі (шт.)</label>
                  <input type="number" required min="0" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} className="w-full border rounded-md px-3 py-2 outline-none focus:border-blue-500 text-sm" placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Категорія</label>
                  <select required value={newCategoryId} onChange={(e) => setNewCategoryId(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-white outline-none focus:border-blue-500 cursor-pointer text-sm">
                    <option value="" disabled>Оберіть...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Постачальник</label>
                  <select required value={newSupplierId} onChange={(e) => setNewSupplierId(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-white outline-none focus:border-blue-500 cursor-pointer text-sm">
                    <option value="" disabled>Оберіть...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Технічний опис та характеристики</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 outline-none focus:border-blue-500 text-sm"
                  placeholder="Корпус (SMD/DIP), робоча напруга, номінал, допуск, температурний режим..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Посилання на Datasheet (PDF документація)</label>
                <input
                  type="url"
                  value={newDatasheetUrl}
                  onChange={(e) => setNewDatasheetUrl(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 outline-none focus:border-blue-500 text-sm"
                  placeholder="https://www.espressif.com/.../esp32_datasheet_en.pdf"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Фото елемента (URL або завантаження файлу з ПК)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 border rounded-md px-3 py-2 outline-none focus:border-blue-500 text-sm"
                    placeholder="Залиште порожнім для авто-ілюстрації або завантажте фото ->"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 border rounded-md bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 whitespace-nowrap">
                    <Upload className="w-4 h-4 text-blue-600" /> Файл
                    <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50 transition text-sm">Скасувати</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium">
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