import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";

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

// Lưu và hiển thị cùng là tiếng Việt
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
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-lg shadow"
    >
      {/* Loại tình trạng */}
      <select
        required
        className="border rounded p-2"
        value={form.conditionType}
        onChange={(e) => setForm({ ...form, conditionType: e.target.value })}
      >
        <option value="">-- Chọn loại tình trạng --</option>
        {conditionTypeOptions.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <input
        type="text"
        required
        placeholder="Tên tình trạng"
        className="border rounded p-2"
        value={form.conditionName}
        onChange={(e) => setForm({ ...form, conditionName: e.target.value })}
      />

      {/* Mức độ */}
      <select
        required
        className="border rounded p-2"
        value={form.severity}
        onChange={(e) => setForm({ ...form, severity: e.target.value })}
      >
        <option value="">-- Chọn mức độ --</option>
        {severityOptions.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>

      <textarea
        placeholder="Mô tả chi tiết"
        className="col-span-1 md:col-span-2 border rounded p-2"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded col-span-1 md:col-span-2"
      >
        {editingData ? "Cập nhật" : "Thêm mới"}
      </button>
    </form>
  );
};

export default MedicalConditionForm;