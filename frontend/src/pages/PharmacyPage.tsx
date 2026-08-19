import React, { useState, useEffect } from 'react';
import { Pill, Search, Plus, AlertTriangle, CheckCircle2, History, Package, Edit3, Trash2, Eye, SlidersHorizontal, Tag, FolderPlus, Layers, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useMedicineStore } from '../store/useMedicineStore';
import { useAuthStore } from '../store/useAuthStore';
import { Medicine, MedicineCategory } from '../types';
import { formatDateIndonesian } from '../utils/formatDate';

export const PharmacyPage: React.FC = () => {
  const { user } = useAuthStore();
  const isPharmacyStaff = user?.role === 'Pharmacist' || user?.role === 'Admin' || user?.role === 'Super Admin';

  const { medicines, categories, fetchMedicines, fetchCategories, addMedicine, updateMedicine, deleteMedicine, adjustStock, addCategory, updateCategory, deleteCategory } = useMedicineStore();

  const [activeTab, setActiveTab] = useState<'inventory' | 'categories' | 'history'>('inventory');
  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  // Column Sorting States
  type SortField = 'name' | 'category' | 'unit' | 'stock' | 'purchase_price' | 'selling_price' | 'expiry_date' | 'status';
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Modals States
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [selectedMedDetail, setSelectedMedDetail] = useState<Medicine | null>(null);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [adjustingStockMed, setAdjustingStockMed] = useState<Medicine | null>(null);
  const [editingCat, setEditingCat] = useState<MedicineCategory | null>(null);

  // Form States
  const [newMedForm, setNewMedForm] = useState({
    name: '',
    category_id: 1,
    manufacturer: '',
    unit: 'Tablet',
    stock: 100,
    min_stock: 20,
    purchase_price: 1000,
    selling_price: 2500,
    expiry_date: '2027-12-31',
    batch_number: '',
    barcode: '',
  });

  const [newCatForm, setNewCatForm] = useState({
    name: '',
    description: '',
  });

  const [stockForm, setStockForm] = useState({
    stock: 0,
    min_stock: 10,
    purchase_price: 0,
    selling_price: 0,
  });

  useEffect(() => {
    fetchCategories();
    fetchMedicines();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  // Filtered Medicines
  const filteredMedicines = medicines.filter((m) => {
    const categoryStr = typeof m.category === 'string' ? m.category : (m.category_name || '');
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.medicine_code.toLowerCase().includes(search.toLowerCase()) ||
      (m.category_name && m.category_name.toLowerCase().includes(search.toLowerCase())) ||
      categoryStr.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategoryFilter === 'All' ||
      m.category_name === selectedCategoryFilter ||
      categoryStr === selectedCategoryFilter ||
      (m.category_id && m.category_id === Number(selectedCategoryFilter));

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    let aVal: any = a[sortField as keyof Medicine] || '';
    let bVal: any = b[sortField as keyof Medicine] || '';

    if (sortField === 'category') {
      const catA = typeof a.category === 'string' ? a.category : (a.category_name || '');
      const catB = typeof b.category === 'string' ? b.category : (b.category_name || '');
      aVal = catA;
      bVal = catB;
    } else if (sortField === 'status') {
      aVal = a.stock <= a.min_stock ? 0 : 1;
      bVal = b.stock <= b.min_stock ? 0 : 1;
    }

    if (typeof aVal === 'string') {
      const res = aVal.localeCompare(bVal);
      return sortOrder === 'asc' ? res : -res;
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const lowStockCount = medicines.filter((m) => m.stock <= m.min_stock).length;

  // Handle Add Medicine Submit
  const handleAddMedicineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCat = categories.find((c) => c.id === Number(newMedForm.category_id)) || categories[0];
    const ok = await addMedicine({
      ...newMedForm,
      category_id: targetCat?.id || 1,
      category_name: targetCat?.name || 'Generik',
      category: targetCat?.name || 'Generik',
    });
    if (ok) {
      setShowAddMedModal(false);
      setNewMedForm({
        name: '',
        category_id: categories[0]?.id || 1,
        manufacturer: '',
        unit: 'Tablet',
        stock: 100,
        min_stock: 20,
        purchase_price: 1000,
        selling_price: 2500,
        expiry_date: '2027-12-31',
        batch_number: '',
        barcode: '',
      });
      showToast('Obat baru berhasil ditambahkan ke inventaris apotek!');
    }
  };

  // Handle Add Category Submit
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await addCategory(newCatForm);
    if (ok) {
      setShowAddCatModal(false);
      setNewCatForm({ name: '', description: '' });
      showToast('Kategori obat baru berhasil ditambahkan!');
    }
  };

  // Handle Edit Medicine Submit
  const handleEditMedicineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMed) return;
    const targetCat = categories.find((c) => c.id === Number(editingMed.category_id));
    const ok = await updateMedicine(editingMed.id, {
      ...editingMed,
      category_name: targetCat?.name || editingMed.category,
      category: targetCat?.name || editingMed.category,
    });
    if (ok) {
      setEditingMed(null);
      showToast(`Data obat "${editingMed.name}" berhasil diperbarui!`);
    }
  };

  // Handle Adjust Stock Submit
  const handleAdjustStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingStockMed) return;
    const ok = await adjustStock(
      adjustingStockMed.id,
      stockForm.stock,
      stockForm.min_stock,
      stockForm.purchase_price,
      stockForm.selling_price
    );
    if (ok) {
      setAdjustingStockMed(null);
      showToast(`Stok obat "${adjustingStockMed.name}" berhasil diperbarui!`);
    }
  };

  // Handle Edit Category Submit
  const handleEditCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;
    const ok = await updateCategory(editingCat.id, editingCat);
    if (ok) {
      setEditingCat(null);
      showToast(`Kategori "${editingCat.name}" berhasil diperbarui!`);
    }
  };

  // Handle Delete Medicine
  const handleDeleteMedicine = async (med: Medicine) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus obat "${med.name}" dari inventaris apotek?`)) {
      await deleteMedicine(med.id);
      showToast(`Obat "${med.name}" telah dihapus.`);
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (cat: MedicineCategory) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kategori obat "${cat.name}"?`)) {
      await deleteCategory(cat.id);
      showToast(`Kategori "${cat.name}" telah dihapus.`);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" /> {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Pill className="w-7 h-7 text-sky-500" /> Pharmacy & Medicine Inventory Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola stok obat, harga HPP & jual, penyesuaian stok, serta relasi master kategori obat apotek
          </p>
        </div>

        {isPharmacyStaff && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddCatModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition flex items-center gap-1.5"
            >
              <FolderPlus className="w-4 h-4 text-teal-500" /> Tambah Kategori
            </button>
            <button
              onClick={() => setShowAddMedModal(true)}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Tambah Obat Baru
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" /> Stok & Inventaris Obat ({medicines.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Kategori Obat Terpisah ({categories.length})
        </button>
      </div>

      {/* Low Stock Alert Warning Banner */}
      {lowStockCount > 0 && activeTab === 'inventory' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Peringatan Stok Obat Menipis ({lowStockCount} Item)</h4>
              <p className="text-[11px] opacity-90">Beberapa stok obat berada di bawah atau sama dengan batas minimum stok (*min_stock*). Harap segera lakukan restok obat.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: MEDICINE INVENTORY LIST */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="glass-card p-4 rounded-2xl border flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari obat berdasarkan nama, kode MED-xxx, produsen, atau kategori..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none font-semibold"
              >
                <option value="All">Semua Kategori Obat ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Medicines Table */}
          <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider select-none">
                  <tr>
                    <th
                      onClick={() => handleSort('name')}
                      className="py-4 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Kode & Nama Obat</span>
                        {sortField === 'name' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-sky-500" /> : <ArrowDown className="w-3 h-3 text-sky-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('category')}
                      className="py-4 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Kategori Obat</span>
                        {sortField === 'category' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-teal-500" /> : <ArrowDown className="w-3 h-3 text-teal-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('unit')}
                      className="py-4 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Kemasan</span>
                        {sortField === 'unit' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-sky-500" /> : <ArrowDown className="w-3 h-3 text-sky-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('stock')}
                      className="py-4 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Stok Saat Ini</span>
                        {sortField === 'stock' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-500" /> : <ArrowDown className="w-3 h-3 text-amber-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('purchase_price')}
                      className="py-4 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Harga HPP / Dasar</span>
                        {sortField === 'purchase_price' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-sky-500" /> : <ArrowDown className="w-3 h-3 text-sky-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('selling_price')}
                      className="py-4 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Harga Jual</span>
                        {sortField === 'selling_price' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-500" /> : <ArrowDown className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('expiry_date')}
                      className="py-4 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Expired Date</span>
                        {sortField === 'expiry_date' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-rose-500" /> : <ArrowDown className="w-3 h-3 text-rose-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('status')}
                      className="py-4 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Status Stok</span>
                        {sortField === 'status' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-500" /> : <ArrowDown className="w-3 h-3 text-indigo-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                        )}
                      </div>
                    </th>

                    <th className="py-4 px-4 text-right whitespace-nowrap">Aksi Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredMedicines.map((med) => {
                    const isLow = med.stock <= med.min_stock;
                    const categoryString = typeof med.category === 'string' ? med.category : (med.category_name || '');
                    const catObj = categories.find((c) => c.id === med.category_id) || categories.find((c) => c.name === categoryString);

                    return (
                      <tr key={med.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 font-mono font-bold text-[10px] border border-sky-500/20">
                            {med.medicine_code}
                          </span>
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-1">{med.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Produsen: {med.manufacturer || 'Generik'}</div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 border border-teal-500/20 font-bold text-[11px] flex items-center gap-1 w-fit">
                            <Tag className="w-3 h-3 text-teal-500" /> {catObj?.name || med.category_name || categoryString || 'Generik'}
                          </span>
                          {catObj?.category_code && (
                            <span className="text-[10px] font-mono text-slate-400 block mt-1">{catObj.category_code}</span>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">{med.unit}</td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{med.stock} {med.unit}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Min Safety: {med.min_stock}</div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-600 dark:text-slate-300 text-xs">Rp {med.purchase_price.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Harga HPP / Modal</div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">Rp {med.selling_price.toLocaleString()}</div>
                          <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">Harga Jual Pasien</div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">{formatDateIndonesian(med.expiry_date)}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Batch: {med.batch_number || 'N/A'}</div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block ${
                            isLow
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse'
                              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          }`}>
                            {isLow ? '⚠️ STOK MENIPIS' : 'AMAH / AMAN'}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedMedDetail(med)}
                              title="Lihat Detail Obat"
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                            >
                              <Eye className="w-4 h-4 text-sky-500" />
                            </button>

                            {isPharmacyStaff && (
                              <>
                                <button
                                  onClick={() => {
                                    setAdjustingStockMed(med);
                                    setStockForm({
                                      stock: med.stock,
                                      min_stock: med.min_stock,
                                      purchase_price: med.purchase_price,
                                      selling_price: med.selling_price,
                                    });
                                  }}
                                  title="Adjust / Edit Stok & Harga"
                                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] flex items-center gap-1 transition shadow-sm"
                                >
                                  <Package className="w-3.5 h-3.5" /> Edit Stok
                                </button>

                                <button
                                  onClick={() => setEditingMed(med)}
                                  title="Edit Info Obat"
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                                >
                                  <Edit3 className="w-4 h-4 text-amber-500" />
                                </button>

                                <button
                                  onClick={() => handleDeleteMedicine(med)}
                                  title="Hapus Obat"
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEDICINE CATEGORIES MASTER TABLE */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-2xl border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-500" /> Master Data Kategori Obat Terpisah
              </h3>
              <p className="text-xs text-slate-500">Tabel master kategori obat berelasi (*One-to-Many*) dengan data obat apotek</p>
            </div>
            {isPharmacyStaff && (
              <button
                onClick={() => setShowAddCatModal(true)}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Tambah Kategori Baru
              </button>
            )}
          </div>

          <div className="glass-card rounded-2xl border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-500 font-bold">
                  <tr>
                    <th className="p-3.5">Kode Kategori</th>
                    <th className="p-3.5">Nama Kategori</th>
                    <th className="p-3.5">Deskripsi Kategori</th>
                    <th className="p-3.5">Jumlah Obat Terkait</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {categories.map((cat) => {
                    const linkedMedsCount = medicines.filter(
                      (m) => m.category_id === cat.id || m.category_name === cat.name || m.category === cat.name
                    ).length;

                    return (
                      <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-mono font-bold text-teal-600">{cat.category_code}</td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 text-sm">{cat.name}</td>
                        <td className="p-3.5 text-slate-500">{cat.description || 'Tidak ada deskripsi'}</td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 font-bold text-xs border border-sky-500/20">
                            {linkedMedsCount} Obat Terhubung
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isPharmacyStaff && (
                              <>
                                <button
                                  onClick={() => setEditingCat(cat)}
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-amber-500 hover:bg-slate-200 transition"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW MEDICINE (WITH CATEGORY SELECTOR) */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <form onSubmit={handleAddMedicineSubmit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b pb-3">
              <Plus className="w-5 h-5 text-sky-500" /> Tambah Obat Baru Ke Inventaris Apotek
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Nama Obat & Dosis</label>
                <input
                  type="text"
                  required
                  value={newMedForm.name}
                  onChange={(e) => setNewMedForm({ ...newMedForm, name: e.target.value })}
                  placeholder="Contoh: Paracetamol 500mg, Amoxicillin 500mg..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Pilih Kategori Obat (Relasi Table)</label>
                <select
                  required
                  value={newMedForm.category_id}
                  onChange={(e) => setNewMedForm({ ...newMedForm, category_id: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Kemasan / Unit</label>
                  <select
                    value={newMedForm.unit}
                    onChange={(e) => setNewMedForm({ ...newMedForm, unit: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold focus:outline-none"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule / Kaplet</option>
                    <option value="Syrup">Syrup / Botol</option>
                    <option value="Ampul">Ampul / Injeksi</option>
                    <option value="Salep">Salep / Cream</option>
                    <option value="Strip">Strip</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Produsen / Pabrik Obat</label>
                  <input
                    type="text"
                    value={newMedForm.manufacturer}
                    onChange={(e) => setNewMedForm({ ...newMedForm, manufacturer: e.target.value })}
                    placeholder="Contoh: Kimia Farma, Kalbe Farma..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Jumlah Stok Awal</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newMedForm.stock}
                    onChange={(e) => setNewMedForm({ ...newMedForm, stock: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Minimum Safety Stock</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newMedForm.min_stock}
                    onChange={(e) => setNewMedForm({ ...newMedForm, min_stock: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Harga HPP / Harga Dasar (Rp)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newMedForm.purchase_price}
                    onChange={(e) => setNewMedForm({ ...newMedForm, purchase_price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Harga Jual Pasien (Rp)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newMedForm.selling_price}
                    onChange={(e) => setNewMedForm({ ...newMedForm, selling_price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Tanggal Kadaluarsa (Expired Date)</label>
                <input
                  type="date"
                  required
                  value={newMedForm.expiry_date}
                  onChange={(e) => setNewMedForm({ ...newMedForm, expiry_date: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowAddMedModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md"
              >
                Simpan Obat Baru
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: EDIT & ADJUST STOK OBAT */}
      {adjustingStockMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <form onSubmit={handleAdjustStockSubmit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b pb-3">
              <Package className="w-5 h-5 text-teal-500" /> Edit & Restok Obat: {adjustingStockMed.name}
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Jumlah Stok Fisik Saat Ini ({adjustingStockMed.unit})</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={stockForm.stock}
                  onChange={(e) => setStockForm({ ...stockForm, stock: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-base text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Batas Safety Stock Minimum (Warning Level)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={stockForm.min_stock}
                  onChange={(e) => setStockForm({ ...stockForm, min_stock: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Harga HPP / Harga Dasar (Rp)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stockForm.purchase_price}
                    onChange={(e) => setStockForm({ ...stockForm, purchase_price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Harga Jual Pasien (Rp)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stockForm.selling_price}
                    onChange={(e) => setStockForm({ ...stockForm, selling_price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => setAdjustingStockMed(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md"
              >
                Simpan Penyesuaian Stok
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: ADD CATEGORY */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <form onSubmit={handleAddCategorySubmit} className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b pb-3">
              <FolderPlus className="w-5 h-5 text-teal-500" /> Tambah Master Kategori Obat Baru
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Nama Kategori Obat</label>
                <input
                  type="text"
                  required
                  value={newCatForm.name}
                  onChange={(e) => setNewCatForm({ ...newCatForm, name: e.target.value })}
                  placeholder="Contoh: Antibiotik, Antihipertensi, Sirup Anak..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 block mb-1 font-semibold">Deskripsi Kategori</label>
                <textarea
                  rows={3}
                  value={newCatForm.description}
                  onChange={(e) => setNewCatForm({ ...newCatForm, description: e.target.value })}
                  placeholder="Deskripsi penggunaan obat dalam kategori ini..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowAddCatModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md"
              >
                Simpan Kategori Baru
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: DETAIL OBAT */}
      {selectedMedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal font-sans">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b pb-3">
              <Eye className="w-5 h-5 text-sky-500" /> Detail Obat: {selectedMedDetail.name}
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Kode Obat:</span>
                <span className="font-mono font-bold text-sky-600">{selectedMedDetail.medicine_code}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Kategori Obat:</span>
                <span className="font-bold text-teal-600">{selectedMedDetail.category_name || (typeof selectedMedDetail.category === 'string' ? selectedMedDetail.category : 'Generik')}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Stok Fisik Saat Ini:</span>
                <span className="font-bold">{selectedMedDetail.stock} {selectedMedDetail.unit}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Minimum Safety Stock:</span>
                <span className="font-bold text-amber-500">{selectedMedDetail.min_stock} {selectedMedDetail.unit}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Harga Jual Pasien:</span>
                <span className="font-bold text-emerald-600">Rp {selectedMedDetail.selling_price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Harga HPP / Harga Dasar:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Rp {selectedMedDetail.purchase_price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Produsen:</span>
                <span className="font-semibold">{selectedMedDetail.manufacturer || 'Generik'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Expired Date:</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{formatDateIndonesian(selectedMedDetail.expiry_date)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={() => setSelectedMedDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
