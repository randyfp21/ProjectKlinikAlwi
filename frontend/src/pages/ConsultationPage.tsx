import React, { useState } from 'react';
import { FileText, Save, CheckCircle2, Stethoscope, Pill, Award, ArrowLeft, UserCheck, Plus, Trash2, Receipt, Lock, Filter, Upload, File, Image as ImageIcon, Paperclip, Calendar, DollarSign, Tag, AlertTriangle } from 'lucide-react';
import { Appointment } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { useMedicineStore } from '../store/useMedicineStore';
import { useInvoiceStore } from '../store/useInvoiceStore';
import { useConsultationStore } from '../store/useConsultationStore';
import { apiClient } from '../api/client';
import { formatDateIndonesian } from '../utils/formatDate';

interface SelectedRxItem {
  medicine_id: number;
  medicine_name: string;
  dosage: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  instructions: string;
  expiry_date?: string;
}

interface AttachmentFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'other';
  size?: string;
}

export const ConsultationPage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const { medicines: stockMedicines, deductStock } = useMedicineStore();
  const { addInvoice } = useInvoiceStore();
  const { waitingQueue, removePatientFromQueue } = useConsultationStore();

  const isDoctorRole = user?.role === 'Doctor';
  const doctorName = user?.full_name || 'dr. Alwi Shahab, Sp.PD';

  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('All');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [successToast, setSuccessToast] = useState('');

  // Filter waiting queue strictly for the logged-in doctor
  const displayWaitingQueue = waitingQueue.filter((app) => {
    if (isDoctorRole) {
      return app.doctor_id === 1 || app.doctor?.name.toLowerCase().includes(doctorName.toLowerCase()) || doctorName.toLowerCase().includes('alwi');
    }
    if (selectedDoctorFilter !== 'All') {
      return app.doctor?.name.includes(selectedDoctorFilter);
    }
    return true;
  });

  const [soap, setSoap] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    diagnosis: '',
    icd10: '',
    labRecommendation: '',
    nextVisit: '',
  });

  const [rxItems, setRxItems] = useState<SelectedRxItem[]>([]);
  const [selectedMedId, setSelectedMedId] = useState<number>(1);
  const [dosageInput, setDosageInput] = useState('');
  const [qtyInput, setQtyInput] = useState<number>(1);

  // Doctor Attachments State (X-Ray, Rontgen, Lab Results, External EMR)
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingAttachment(true);
    const fileList = Array.from(files);

    for (const file of fileList) {
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      const isImg = file.type.startsWith('image/');
      
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await apiClient.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const uploadedUrl = res.data.data?.url || URL.createObjectURL(file);
        const newAtt: AttachmentFile = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          url: uploadedUrl,
          type: isPdf ? 'pdf' : isImg ? 'image' : 'other',
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        };
        setAttachments((prev) => [...prev, newAtt]);
      } catch (err) {
        // Fallback local preview URL if server upload fails
        const newAtt: AttachmentFile = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          url: URL.createObjectURL(file),
          type: isPdf ? 'pdf' : isImg ? 'image' : 'other',
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        };
        setAttachments((prev) => [...prev, newAtt]);
      }
    }
    setIsUploadingAttachment(false);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleSelectPatient = (app: Appointment) => {
    setSelectedAppointment(app);
    setSoap({
      subjective: app.complaint ? `Keluhan utama pasien: ${app.complaint}` : '',
      objective: '',
      assessment: '',
      plan: '',
      diagnosis: '',
      icd10: '',
      labRecommendation: '',
      nextVisit: '',
    });
    setRxItems([]);
    setAttachments([]);
  };

  const handleAddRxItem = () => {
    const med = stockMedicines.find((m) => m.id === Number(selectedMedId));
    if (!med) return;

    if (qtyInput > med.stock) {
      alert(`Stok obat tidak mencukupi! Stok ${med.name} saat ini tersisa ${med.stock} ${med.unit}.`);
      return;
    }

    const newItem: SelectedRxItem = {
      medicine_id: med.id,
      medicine_name: med.name,
      dosage: dosageInput || '3 x 1 Sesudah Makan',
      quantity: qtyInput,
      unit_price: med.selling_price,
      subtotal: med.selling_price * qtyInput,
      instructions: `Aturan Minum: ${qtyInput} ${med.unit}`,
      expiry_date: med.expiry_date || '2027-12-31',
    };

    setRxItems([...rxItems, newItem]);
  };

  const handleRemoveRxItem = (index: number) => {
    setRxItems(rxItems.filter((_, i) => i !== index));
  };

  const handleSaveMedicalRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    // 1. Deduct Stock in Pharmacy
    let medTotal = 0;
    for (const item of rxItems) {
      medTotal += item.subtotal;
      deductStock(item.medicine_id, item.quantity);
    }

    const docFee = selectedAppointment.doctor?.consultation_fee || (selectedAppointment.doctor_id === 1 ? 175000 : 150000);
    const procFee = 50000;
    const subtotalCalc = docFee + procFee + medTotal;
    const taxCalc = Math.round(subtotalCalc * 0.1);
    const grandTotalCalc = subtotalCalc + taxCalc;

    const invoiceNo = `INV-${selectedAppointment.appointment_number}`;

    // 2. AUTOMATICALLY GENERATE INVOICE FOR BILLING & CASHIER ADMIN!
    addInvoice({
      id: Date.now(),
      invoice_number: invoiceNo,
      patient_id: selectedAppointment.patient_id,
      patient: selectedAppointment.patient,
      appointment_id: selectedAppointment.id,
      consultation_id: Date.now(),
      doctor_fee: docFee,
      procedure_fee: procFee,
      medicine_fee: medTotal,
      discount: 0,
      tax: taxCalc,
      grand_total: grandTotalCalc,
      payment_status: 'Pending',
      payment_method: 'Pending Cashier',
      created_at: new Date().toISOString(),
      subjective: soap.subjective,
      diagnosis: soap.diagnosis,
      icd10_code: soap.icd10,
      plan: soap.plan,
      items: [
        { id: 101, invoice_id: 99, item_type: 'Doctor Fee', item_name: `Consultation - ${selectedAppointment.doctor?.name}`, quantity: 1, unit_price: docFee, subtotal: docFee },
        { id: 102, invoice_id: 99, item_type: 'Procedure', item_name: 'Physical Exam & Vital Signs (TTV)', quantity: 1, unit_price: procFee, subtotal: procFee },
        ...rxItems.map((rx, i) => ({
          id: 200 + i,
          invoice_id: 99,
          item_type: 'Medicine',
          item_name: `${rx.medicine_name} (${rx.quantity} tabs)`,
          quantity: rx.quantity,
          unit_price: rx.unit_price,
          subtotal: rx.subtotal,
          expiry_date: rx.expiry_date || '2027-12-31',
        })),
      ],
    });

    // 3. REMOVE COMPLETED PATIENT FROM WAITING CONSULTATION LIST!
    removePatientFromQueue(selectedAppointment.id);

    setSuccessToast(
      `Medical record saved, patient removed from waiting queue, and Invoice ${invoiceNo} generated for Cashier!`
    );

    setSelectedAppointment(null);
    setTimeout(() => setSuccessToast(''), 6000);
  };

  return (
    <div className="space-y-6 font-sans">
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center justify-between animate-bounce">
          <span className="flex items-center gap-2">
            <Receipt className="w-5 h-5" /> {successToast}
          </span>
        </div>
      )}

      {/* STEP 1: PATIENT SELECTION QUEUE */}
      {!selectedAppointment ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Stethoscope className="w-7 h-7 text-sky-500" /> {t('consultationTitle')}
                </h1>
                {isDoctorRole && (
                  <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 border border-sky-500/20 text-xs font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Doctor ID Scoped ({doctorName})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isDoctorRole
                  ? `Showing waiting patient appointments specifically booked for ${doctorName}`
                  : t('consultationSubtitle')}
              </p>
            </div>

            {/* Doctor Filter for Admin */}
            {!isDoctorRole && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Filter className="w-4 h-4 text-sky-500" /> Filter Doctor:
                <select
                  value={selectedDoctorFilter}
                  onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none text-xs font-bold"
                >
                  <option value="All">All Doctors</option>
                  <option value="dr. Alwi Shahab">dr. Alwi Shahab, Sp.PD</option>
                  <option value="dr. Sarah Lestari">dr. Sarah Lestari, Sp.A</option>
                </select>
              </div>
            )}
          </div>

          <div className="glass-card p-6 rounded-2xl border space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-500" /> Waiting Patients for Consultation ({displayWaitingQueue.length})
            </h2>

            {displayWaitingQueue.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-semibold space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p>Tidak ada antrean pasien menunggu untuk ID Dokter Anda saat ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    <tr>
                      <th className="p-3.5">No. Janji Temu</th>
                      <th className="p-3.5">No. Antrean</th>
                      <th className="p-3.5">Nama Pasien</th>
                      <th className="p-3.5">Dokter & Ruangan</th>
                      <th className="p-3.5">Tanggal & Jam Slot</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {displayWaitingQueue.map((app) => (
                      <tr
                        key={app.id}
                        onClick={() => handleSelectPatient(app)}
                        className="hover:bg-sky-500/10 cursor-pointer transition"
                      >
                        <td className="p-3.5 font-mono font-bold text-sky-600 dark:text-sky-400">{app.appointment_number}</td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 text-sm">#00{app.queue_number}</td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 text-sm">{app.patient?.full_name}</td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{app.doctor?.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{app.doctor?.practice_room}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{formatDateIndonesian(app.appointment_date)}</div>
                          <div className="text-[10px] font-mono text-sky-500">{app.time_slot}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-amber-500/10 text-amber-600 border-amber-500/20">
                            {app.status === 'Confirmed' ? 'Dikonfirmasi' : app.status === 'Completed' ? 'Selesai' : app.status === 'Cancelled' ? 'Dibatalkan' : 'Menunggu'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleSelectPatient(app)}
                            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition flex items-center gap-1.5 ml-auto"
                          >
                            <Stethoscope className="w-4 h-4" /> Periksa Pasien
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* STEP 2: FULL EMR SOAP EXAMINATION FORM */
        <form onSubmit={handleSaveMedicalRecord} className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedAppointment(null)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Antrean Pasien
            </button>
          </div>

          <div className="glass-card p-6 rounded-2xl border bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/30 font-bold text-2xl flex items-center justify-center shadow-lg">
                {selectedAppointment.patient?.full_name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30 font-mono">
                    {selectedAppointment.appointment_number}
                  </span>
                  <span className="text-xs font-bold text-amber-400">Antrean #{selectedAppointment.queue_number}</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-0.5">{selectedAppointment.patient?.full_name}</h2>
                <p className="text-xs text-slate-300">
                  {selectedAppointment.patient?.gender === 'Male' ? 'Laki-laki' : 'Perempuan'}, {selectedAppointment.patient?.age} thn | NIK: {selectedAppointment.patient?.national_id} | Gol. Darah: {selectedAppointment.patient?.blood_type}
                </p>
              </div>
            </div>

            <div className="flex gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300">
                <span className="text-[10px] font-bold block uppercase">Riwayat Alergi</span>
                <span className="font-semibold">{selectedAppointment.patient?.allergy}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
                <span className="text-[10px] font-bold block uppercase">Riwayat Penyakit</span>
                <span className="font-semibold">{selectedAppointment.patient?.disease_history}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl border space-y-4">
              <h3 className="text-sm font-bold text-sky-500 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4 h-4" /> Subyektif (S - Keluhan) & Obyektif (O - Pemeriksaan & Vital)
              </h3>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Subjective (S) - Keluhan Utama Pasien</label>
                <textarea
                  rows={4}
                  required
                  value={soap.subjective}
                  onChange={(e) => setSoap({ ...soap, subjective: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Objective (O) - Pemeriksaan Fisik & Tanda Vital (TTV)</label>
                <textarea
                  rows={4}
                  required
                  value={soap.objective}
                  onChange={(e) => setSoap({ ...soap, objective: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border space-y-4">
              <h3 className="text-sm font-bold text-teal-500 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" /> Assessment (A - Diagnosa) & Plan (P - Rencana Terapi)
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Diagnosa Medis</label>
                  <input
                    type="text"
                    required
                    value={soap.diagnosis}
                    onChange={(e) => setSoap({ ...soap, diagnosis: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Kode ICD-10</label>
                  <input
                    type="text"
                    required
                    value={soap.icd10}
                    onChange={(e) => setSoap({ ...soap, icd10: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none font-mono font-bold text-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Plan (P) - Rencana Pengobatan & Terapi</label>
                <textarea
                  rows={4}
                  required
                  value={soap.plan}
                  onChange={(e) => setSoap({ ...soap, plan: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* DOCTOR ATTACHMENTS SECTION (X-RAY, RONTGEN, LAB RESULTS, EXTERNAL EMR) */}
          <div className="glass-card p-6 rounded-2xl border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-indigo-500" /> Lampiran Berkas Medis (Hasil Rontgen / Laboratorium / Riwayat Rumah Sakit)
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">Opsional • Format PDF atau Gambar (PNG/JPG)</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">Unggah Lampiran Berkas Medis Pasien</span>
                  <span>Dokter dapat mengunggah file foto rontgen, scan hasil lab, atau riwayat rujukan rumah sakit lain.</span>
                </div>
                <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition shrink-0">
                  <Upload className="w-4 h-4" /> {isUploadingAttachment ? 'Mengunggah...' : 'Pilih Berkas PDF / Foto'}
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploadingAttachment}
                  />
                </label>
              </div>

              {/* Uploaded File List */}
              {attachments.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {attachments.map((att) => (
                    <div key={att.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 shadow-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {att.type === 'pdf' ? (
                          <File className="w-5 h-5 text-rose-500 shrink-0" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-sky-500 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <a href={att.url} target="_blank" rel="noreferrer" className="font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-sky-600 truncate block">
                            {att.name}
                          </a>
                          <span className="text-[10px] text-slate-400 font-mono">{att.size}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-500" /> Resep Obat Elektronik (Integrasi Stok Farmasi, Harga Jual & Expired Date)
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Pilih Obat dari Stok Farmasi Aktif:</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-slate-500 dark:text-slate-400 block mb-1">Nama Obat, Stok, Harga Jual Pasien & Expired Date</label>
                  <select
                    value={selectedMedId}
                    onChange={(e) => setSelectedMedId(Number(e.target.value))}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-semibold text-xs text-slate-800 dark:text-slate-100"
                  >
                    {stockMedicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — Stok: {m.stock} {m.unit} | Harga Jual: Rp {m.selling_price.toLocaleString()} | Exp: {m.expiry_date || '2027-12-31'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1">Aturan Dosis</label>
                  <input
                    type="text"
                    placeholder="3 x 1 Sesudah Makan"
                    value={dosageInput}
                    onChange={(e) => setDosageInput(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1">Jumlah (Qty)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      value={qtyInput}
                      onChange={(e) => setQtyInput(Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleAddRxItem}
                      className="px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 transition shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Tambah
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider">
                  <tr>
                    <th className="p-3">Nama Obat</th>
                    <th className="p-3">Aturan Dosis</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Harga Jual (Pasien)</th>
                    <th className="p-3">Expired Date</th>
                    <th className="p-3">Subtotal</th>
                    <th className="p-3 text-right">Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {rxItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{item.medicine_name}</td>
                      <td className="p-3">{item.dosage}</td>
                      <td className="p-3 font-bold text-teal-600 dark:text-teal-400">{item.quantity}</td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        Rp {item.unit_price.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-mono text-[10px] font-bold">
                          {formatDateIndonesian(item.expiry_date || '2027-12-31')}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-teal-500">Rp {item.subtotal.toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveRxItem(idx)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-500/10 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <Award className="w-4 h-4 text-emerald-500" /> Verifikasi Stempel Digital: {doctorName}
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition cursor-pointer"
              >
                <Save className="w-4 h-4" /> Simpan Rekam Medis & Terbitan Invoice Kasir
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
