// MedicalConditionForm.tsx - Cải thiện giao diện
import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { Save, X } from "lucide-react";

interface MedicalConditionFormProps {
  studentId: number;
  onSaved: () => void;
  editingData: MedicalCondition | null;
  clearEditing: () => void;
}

interface MedicalCondition {
  conditionId: number;
  conditionType: string;
  conditionName: string;
  severity: string;
  description: string;
  studentId: number;
  studentName: string;
}

const conditionTypeOptions = [
  "Dị ứng",
  "Bệnh mãn tính",
  "Tiền sử bệnh",
  "Thị lực",
  "Thính lực",
];

const severityOptions = ["Nhẹ", "Trung bình", "Nặng"];

const MedicalConditionForm = ({
  studentId,
  onSaved,
  editingData,
  clearEditing,
}: MedicalConditionFormProps) => {
  const [form, setForm] = useState({
    conditionType: "",
    conditionName: "",
    severity: "",
    description: "",
  });

  useEffect(() => {
    if (editingData) {
      setForm({
        conditionType: editingData.conditionType,
        conditionName: editingData.conditionName,
        severity: editingData.severity,
        description: editingData.description,
      });
    } else {
      setForm({
        conditionType: "",
        conditionName: "",
        severity: "",
        description: "",
      });
    }
  }, [editingData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingData) {
        await axios.put(`/parent/health/medical-condition/${editingData.conditionId}`, {
          ...form,
          studentId,
        });
        toast.success("Cập nhật thành công!");
      } else {
        await axios.post("/parent/health/medical-condition", {
          ...form,
          studentId,
        });
        toast.success("Thêm mới thành công!");
      }
      onSaved();
      clearEditing();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi gửi thông tin.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Loại tình trạng */}
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        Loại tình trạng <span className="text-red-500">*</span>
      </label>
      <select
        required
        className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white text-black placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        value={form.conditionType}
        onChange={(e) => setForm({ ...form, conditionType: e.target.value })}
      >
        <option value="">-- Chọn loại tình trạng --</option>
        {conditionTypeOptions.map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
    </div>

    {/* Tên tình trạng */}
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        Tên tình trạng <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        required
        placeholder="Ví dụ: Hen suyễn, Cận thị..."
        className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white text-black placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        value={form.conditionName}
        onChange={(e) => setForm({ ...form, conditionName: e.target.value })}
      />
    </div>

    {/* Mức độ */}
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        Mức độ nghiêm trọng <span className="text-red-500">*</span>
      </label>
      <select
        required
        className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white text-black placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        value={form.severity}
        onChange={(e) => setForm({ ...form, severity: e.target.value })}
      >
        <option value="">-- Chọn mức độ --</option>
        {severityOptions.map((level) => (
          <option key={level} value={level}>{level}</option>
        ))}
      </select>
    </div>

    {/* Mô tả */}
    <div className="space-y-2 md:col-span-2">
      <label className="block text-sm font-semibold text-gray-700">
        Mô tả chi tiết
      </label>
      <textarea
        placeholder="Ghi chú thêm về tình trạng sức khỏe, triệu chứng, cách xử lý..."
        className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white text-black placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        rows={4}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
    </div>
  </div>

  {/* Buttons */}
  <div className="flex space-x-4">
    <button
      type="submit"
      className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg"
    >
      <Save size={20} />
      <span>{editingData ? "Cập nhật" : "Thêm mới"}</span>
    </button>

    {editingData && (
      <button
        type="button"
        onClick={clearEditing}
        className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-xl transition-all"
      >
        <X size={20} />
        <span>Hủy</span>
      </button>
    )}
  </div>
</form>

  );
};

export default MedicalConditionForm;
