import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { Save, X, Pill, Calendar, FileText } from "lucide-react";

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
    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
          <Pill className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            {editingData ? "Chỉnh sửa thông tin thuốc" : "Gửi thuốc mới cho học sinh"}
          </h3>
          <p className="text-sm text-gray-600">Điền đầy đủ thông tin để gửi yêu cầu cho nhà trường</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Tên thuốc */}
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
        <Pill size={16} className="text-green-600" />
        <span>Tên thuốc <span className="text-red-500">*</span></span>
      </label>
      <input
        type="text"
        required
        placeholder="Ví dụ: Paracetamol, Vitamin C..."
        className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white text-black placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
        value={form.medicationName}
        onChange={(e) => setForm({ ...form, medicationName: e.target.value })}
      />
    </div>

    {/* Liều dùng */}
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
        <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
        <span>Liều dùng <span className="text-red-500">*</span></span>
      </label>
      <select
        required
        value={form.dosage}
        onChange={(e) => setForm({ ...form, dosage: e.target.value })}
        className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white text-black placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
      >
        <option value="">-- Chọn liều dùng --</option>
        {dosageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>

    {/* Tần suất */}
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
        <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
        <span>Tần suất sử dụng <span className="text-red-500">*</span></span>
      </label>
      <select
        required
        value={form.frequency}
        onChange={(e) => setForm({ ...form, frequency: e.target.value })}
        className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white text-black placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
      >
        <option value="">-- Chọn tần suất --</option>
        {frequencyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>

    {/* Hướng dẫn */}
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
        <FileText size={16} className="text-orange-600" />
        <span>Hướng dẫn sử dụng</span>
      </label>
      <input
        type="text"
        placeholder="Ví dụ: Uống sau ăn, uống với nước ấm..."
        className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white text-black placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
        value={form.instructions}
        onChange={(e) => setForm({ ...form, instructions: e.target.value })}
      />
    </div>

    {/* Ngày bắt đầu */}
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
        <Calendar size={16} className="text-blue-600" />
        <span>Ngày bắt đầu <span className="text-red-500">*</span></span>
      </label>
      <input
        type="date"
        required
        min={today}
        value={form.startDate}
        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
        className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
      />
    </div>

    {/* Ngày kết thúc */}
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
        <Calendar size={16} className="text-red-600" />
        <span>Ngày kết thúc <span className="text-red-500">*</span></span>
      </label>
      <input
        type="date"
        required
        min={form.startDate || today}
        value={form.endDate}
        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
        className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white text-black focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
      />
    </div>
  </div>

  {/* Buttons */}
  <div className="flex space-x-4 pt-4 border-t border-gray-200">
    <button
      type="submit"
      className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg"
    >
      <Save size={20} />
      <span>{editingData ? "Cập nhật thuốc" : "Gửi thuốc"}</span>
    </button>

    {editingData && (
      <button
        type="button"
        onClick={clearEditing}
        className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-xl transition-all"
      >
        <X size={20} />
        <span>Hủy chỉnh sửa</span>
      </button>
    )}
  </div>
</form>


    </div>
  );
};

export default MedicationForm;