import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";

interface MedicationFormProps {
  studentId: number;
  editingData: any | null;
  onSaved: () => void;
  clearEditing: () => void;
}

const dosageOptions = ["1 viên", "2 viên", "5 ml", "10 ml", "Khác"];
const frequencyOptions = ["1 lần/ngày", "2 lần/ngày", "3 lần/ngày"];

const MedicationForm = ({ studentId, editingData, onSaved, clearEditing }: MedicationFormProps) => {
  const [form, setForm] = useState({
    medicationName: "",
    dosage: "",
    frequency: "",
    instructions: "",
    startDate: "",
    endDate: "",
  });

  const today = new Date().toISOString().split("T")[0]; // yyyy-MM-dd

  useEffect(() => {
    if (editingData) {
      setForm({
        medicationName: editingData.medicationName,
        dosage: editingData.dosage,
        frequency: editingData.frequency,
        instructions: editingData.instructions,
        startDate: editingData.startDate.split("T")[0],
        endDate: editingData.endDate.split("T")[0],
      });
    } else {
      setForm({
        medicationName: "",
        dosage: "",
        frequency: "",
        instructions: "",
        startDate: "",
        endDate: "",
      });
    }
  }, [editingData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra logic ngày
    if (form.startDate < today) {
      toast.error("Ngày bắt đầu không được là ngày trong quá khứ.");
      return;
    }
    if (form.endDate < form.startDate) {
      toast.error("Ngày kết thúc không được trước ngày bắt đầu.");
      return;
    }

    try {
      if (editingData) {
        await axios.put(`/parent/health/medication/${editingData.medicationId}`, form);
        toast.success("Cập nhật thuốc thành công!");
      } else {
        await axios.post("/parent/health/medication", {
          ...form,
          studentId,
        });
        toast.success("Gửi thuốc thành công!");
      }
      onSaved();
      clearEditing();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi gửi thông tin.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded shadow">
      <input
        type="text"
        required
        placeholder="Tên thuốc"
        value={form.medicationName}
        onChange={(e) => setForm({ ...form, medicationName: e.target.value })}
        className="border rounded p-2"
      />

      <select
        required
        value={form.dosage}
        onChange={(e) => setForm({ ...form, dosage: e.target.value })}
        className="border rounded p-2"
      >
        <option value="">-- Chọn liều dùng --</option>
        {dosageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>

      <select
        required
        value={form.frequency}
        onChange={(e) => setForm({ ...form, frequency: e.target.value })}
        className="border rounded p-2"
      >
        <option value="">-- Chọn tần suất --</option>
        {frequencyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>

      <input
        type="text"
        placeholder="Hướng dẫn"
        value={form.instructions}
        onChange={(e) => setForm({ ...form, instructions: e.target.value })}
        className="border rounded p-2"
      />

      <input
        type="date"
        required
        min={today}
        value={form.startDate}
        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
        className="border rounded p-2"
      />

      <input
        type="date"
        required
        min={form.startDate || today}
        value={form.endDate}
        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
        className="border rounded p-2"
      />

      <button
        type="submit"
        className="col-span-1 md:col-span-2 bg-green-600 text-white font-semibold px-4 py-2 rounded"
      >
        {editingData ? "Cập nhật" : "Gửi thuốc"}
      </button>
    </form>
  );
};

export default MedicationForm;