import { create } from 'zustand';
import { Medicine, MedicineCategory } from '../types';
import { apiClient } from '../api/client';

interface MedicineState {
  medicines: Medicine[];
  categories: MedicineCategory[];
  loading: boolean;
  error: string;

  fetchMedicines: (search?: string, category?: string) => Promise<void>;
  fetchCategories: () => Promise<void>;

  // Category Actions
  addCategory: (cat: Partial<MedicineCategory>) => Promise<boolean>;
  updateCategory: (id: number, cat: Partial<MedicineCategory>) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;

  // Medicine Actions
  addMedicine: (med: Partial<Medicine>) => Promise<boolean>;
  updateMedicine: (id: number, med: Partial<Medicine>) => Promise<boolean>;
  deleteMedicine: (id: number) => Promise<boolean>;
  adjustStock: (id: number, newStock: number, minStock?: number, purchasePrice?: number, sellingPrice?: number) => Promise<boolean>;

  deductStock: (medicineId: number, qty: number) => boolean;
}

const INITIAL_CATEGORIES: MedicineCategory[] = [
  { id: 1, category_code: 'CAT-ANALGESIC', name: 'Analgesic & Antipyretic', description: 'Obat pereda nyeri dan penurun demam' },
  { id: 2, category_code: 'CAT-ANTIBIOTIC', name: 'Antibiotic', description: 'Obat infeksi bakteri dan antimikroba' },
  { id: 3, category_code: 'CAT-ANTIHYPERTENSIVE', name: 'Antihypertensive', description: 'Obat penurun tekanan darah tinggi' },
  { id: 4, category_code: 'CAT-GASTRO', name: 'Gastroprotective', description: 'Obat lambung, maag, dan asam lambung' },
  { id: 5, category_code: 'CAT-ANTIHISTAMINE', name: 'Antihistamine', description: 'Obat alergi dan gatal-gatal' },
];

const INITIAL_MEDICINES: Medicine[] = [
  { id: 1, category_id: 1, category_name: 'Analgesic & Antipyretic', medicine_code: 'MED-001', name: 'Paracetamol 500mg', category: 'Analgesic & Antipyretic', manufacturer: 'Kimia Farma', unit: 'Tablet', stock: 250, min_stock: 50, purchase_price: 500, selling_price: 1200, expiry_date: '2027-12-31', batch_number: 'BATCH-2024-001', barcode: '8991001001001' },
  { id: 2, category_id: 2, category_name: 'Antibiotic', medicine_code: 'MED-002', name: 'Amoxicillin 500mg', category: 'Antibiotic', manufacturer: 'Kalbe Farma', unit: 'Capsule', stock: 180, min_stock: 30, purchase_price: 1500, selling_price: 3500, expiry_date: '2026-10-15', batch_number: 'BATCH-2024-002', barcode: '8991001001002' },
  { id: 3, category_id: 3, category_name: 'Antihypertensive', medicine_code: 'MED-003', name: 'Amlodipine 10mg', category: 'Antihypertensive', manufacturer: 'Dexa Medica', unit: 'Tablet', stock: 120, min_stock: 20, purchase_price: 2000, selling_price: 4500, expiry_date: '2027-06-30', batch_number: 'BATCH-2024-003', barcode: '8991001001003' },
  { id: 4, category_id: 4, category_name: 'Gastroprotective', medicine_code: 'MED-004', name: 'Omeprazole 20mg', category: 'Gastroprotective', manufacturer: 'Sanbe Farma', unit: 'Capsule', stock: 8, min_stock: 15, purchase_price: 3000, selling_price: 7000, expiry_date: '2026-09-01', batch_number: 'BATCH-2024-004', barcode: '8991001001004' },
  { id: 5, category_id: 5, category_name: 'Antihistamine', medicine_code: 'MED-005', name: 'Cetirizine 10mg', category: 'Antihistamine', manufacturer: 'Phapros', unit: 'Tablet', stock: 300, min_stock: 40, purchase_price: 800, selling_price: 2000, expiry_date: '2027-08-20', batch_number: 'BATCH-2024-005', barcode: '8991001001005' },
];

export const useMedicineStore = create<MedicineState>((set, get) => ({
  medicines: INITIAL_MEDICINES,
  categories: INITIAL_CATEGORIES,
  loading: false,
  error: '',

  fetchCategories: async () => {
    try {
      const res = await apiClient.get('/medicine-categories');
      if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        set({ categories: res.data.data });
      }
    } catch (err) {
      // Keep initial local categories if offline
    }
  },

  fetchMedicines: async (search = '', category = '') => {
    set({ loading: true });
    try {
      const res = await apiClient.get('/medicines', { params: { search, category } });
      if (res.data.success && Array.isArray(res.data.data)) {
        set({ medicines: res.data.data, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      set({ loading: false });
    }
  },

  addCategory: async (catData) => {
    try {
      const res = await apiClient.post('/medicine-categories', catData);
      if (res.data.success && res.data.data) {
        set((state) => ({ categories: [...state.categories, res.data.data] }));
        return true;
      }
    } catch (err) {
      // Fallback local add
      const newCat: MedicineCategory = {
        id: Date.now(),
        category_code: catData.category_code || `CAT-${Date.now()}`,
        name: catData.name || 'Kategori Baru',
        description: catData.description || '',
      };
      set((state) => ({ categories: [...state.categories, newCat] }));
      return true;
    }
    return false;
  },

  updateCategory: async (id, catData) => {
    try {
      const res = await apiClient.put(`/medicine-categories/${id}`, catData);
      if (res.data.success) {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...catData } : c)),
        }));
        return true;
      }
    } catch (err) {
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? { ...c, ...catData } : c)),
      }));
      return true;
    }
    return false;
  },

  deleteCategory: async (id) => {
    try {
      await apiClient.delete(`/medicine-categories/${id}`);
    } catch (err) {
      // continue
    }
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
    return true;
  },

  addMedicine: async (medData) => {
    try {
      const res = await apiClient.post('/medicines', medData);
      if (res.data.success && res.data.data) {
        set((state) => ({ medicines: [res.data.data, ...state.medicines] }));
        return true;
      }
    } catch (err) {
      const targetCat = get().categories.find((c) => c.id === medData.category_id);
      const catName = targetCat?.name || (typeof medData.category === 'string' ? medData.category : 'Umum');
      const newMed: Medicine = {
        id: Date.now(),
        category_id: medData.category_id,
        category_name: catName,
        category: catName,
        medicine_code: medData.medicine_code || `MED-${Date.now()%10000}`,
        name: medData.name || 'Obat Baru',
        manufacturer: medData.manufacturer || 'Generik',
        unit: medData.unit || 'Tablet',
        stock: medData.stock || 0,
        min_stock: medData.min_stock || 10,
        purchase_price: medData.purchase_price || 0,
        selling_price: medData.selling_price || 0,
        expiry_date: medData.expiry_date || '2027-12-31',
        batch_number: medData.batch_number || `BATCH-${Date.now()}`,
        barcode: medData.barcode || '8991000000000',
      };
      set((state) => ({ medicines: [newMed, ...state.medicines] }));
      return true;
    }
    return false;
  },

  updateMedicine: async (id, medData) => {
    try {
      const res = await apiClient.put(`/medicines/${id}`, medData);
      if (res.data.success) {
        get().fetchMedicines();
        return true;
      }
    } catch (err) {
      // Local update
    }
    set((state) => ({
      medicines: state.medicines.map((m) => (m.id === id ? { ...m, ...medData } : m)),
    }));
    return true;
  },

  deleteMedicine: async (id) => {
    try {
      await apiClient.delete(`/medicines/${id}`);
    } catch (err) {
      // continue
    }
    set((state) => ({
      medicines: state.medicines.filter((m) => m.id !== id),
    }));
    return true;
  },

  adjustStock: async (id, newStock, minStock, purchasePrice, sellingPrice) => {
    const med = get().medicines.find((m) => m.id === id);
    if (!med) return false;

    const updatedData: Partial<Medicine> = {
      ...med,
      stock: newStock,
      min_stock: minStock !== undefined ? minStock : med.min_stock,
      purchase_price: purchasePrice !== undefined ? purchasePrice : med.purchase_price,
      selling_price: sellingPrice !== undefined ? sellingPrice : med.selling_price,
    };

    try {
      await apiClient.put(`/medicines/${id}`, updatedData);
    } catch (err) {
      // fallback
    }

    set((state) => ({
      medicines: state.medicines.map((m) => (m.id === id ? { ...m, ...updatedData } : m)),
    }));
    return true;
  },

  deductStock: (medicineId: number, qty: number) => {
    const list = get().medicines;
    const target = list.find((m) => m.id === medicineId);

    if (!target) return false;
    if (target.stock < qty) return false;

    set({
      medicines: list.map((m) => (m.id === medicineId ? { ...m, stock: m.stock - qty } : m)),
    });
    return true;
  },
}));
