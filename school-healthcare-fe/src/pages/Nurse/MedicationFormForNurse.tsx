import { useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { Pill, UserCheck, Save, X } from "lucide-react";

const dosageOptions = ["1 viên", "2 viên", "5 ml", "10 ml", "Khác"];
const frequencyOptions = ["1 lần/ngày", "2 lần/ngày", "3 lần/ngày"];

const MedicationFormForNurse = ({ onSaved }: { onSaved: () => void }) => {
  const [form, setForm] = useState({
    studentId: 0,
    medicationName: "",
    dosage: "",
    frequency: "",
    instructions: "",
    startDate: "",
    endDate: "",
  });

  const [studentName, setStudentName] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [studentValid, setStudentValid] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.studentId) {
      toast.error("Vui lòng chọn học sinh.");
      return;
    }
    if (form.startDate < today) {
      toast.error("Ngày bắt đầu không được trong quá khứ.");
      return;
    }
    if (form.endDate < form.startDate) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu.");
      return;
    }

    try {
      await axios.post("/nurse/medications", form);
      toast.success("Đã thêm thuốc cho học sinh.");
      setForm({
        studentId: 0,
        medicationName: "",
        dosage: "",
        frequency: "",
        instructions: "",
        startDate: "",
        endDate: "",
      });
      setStudentName("");
      setStudentValid(false);
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi thêm thuốc.");
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
          <Pill className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Thêm thuốc cho học sinh</h3>
          <p className="text-sm text-gray-600">Y tá ghi nhận thuốc được phụ huynh đem đến</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 🔍 Tìm học sinh */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-800 text-sm">Tìm học sinh</span>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Nhập tên học sinh để tìm..."
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={studentName}
              onChange={async (e) => {
                const keyword = e.target.value;
                setStudentName(keyword);
                if (keyword.length < 2) return;
                try {
                  const res = await axios.get(`/student/search?name=${encodeURIComponent(keyword)}`);
                  setSearchResults(res.data);
                  setShowDropdown(true);
                } catch {
                  toast.error("Lỗi khi tìm học sinh.");
                }
              }}
            />
            {showDropdown && searchResults.length > 0 && (
              <ul className="absolute z-10 bg-white border rounded-md shadow-md mt-1 w-full max-h-48 overflow-auto">
                {searchResults.map((stu) => (
                  <li
                    key={stu.studentId}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, studentId: stu.studentId }));
                      setStudentName(stu.name);
                      setStudentValid(true);
                      setShowDropdown(false);
                    }}
                    className="p-2 hover:bg-blue-100 cursor-pointer text-sm"
                  >
                    <div className="font-medium">{stu.name}</div>
                    <div className="text-xs text-gray-500">
                      PH: {stu.parentName} - Lớp: {stu.className}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {studentValid && (
              <div className="mt-2 text-green-600 text-xs">
                ✅ Đã chọn học sinh: {studentName}
              </div>
            )}
          </div>
        </div>

        {/* Các trường thuốc */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tên thuốc */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Tên thuốc <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
              placeholder="Ví dụ: Paracetamol, Vitamin C..."
              value={form.medicationName}
              onChange={(e) => setForm({ ...form, medicationName: e.target.value })}
            />
          </div>

          {/* Liều dùng */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Liều dùng <span className="text-red-500">*</span></label>
            <select
              required
              value={form.dosage}
              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
            >
              <option value="">-- Chọn liều dùng --</option>
              {dosageOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Tần suất */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Tần suất <span className="text-red-500">*</span></label>
            <select
              required
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
            >
              <option value="">-- Chọn tần suất --</option>
              {frequencyOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Hướng dẫn */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Hướng dẫn</label>
            <input
              type="text"
              placeholder="Uống sau ăn, uống với nước ấm..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            />
          </div>

          {/* Ngày bắt đầu */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Ngày bắt đầu <span className="text-red-500">*</span></label>
            <input
              type="date"
              required
              min={today}
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
            />
          </div>

          {/* Ngày kết thúc */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Ngày kết thúc <span className="text-red-500">*</span></label>
            <input
              type="date"
              required
              min={form.startDate || today}
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105"
          >
            <Save size={20} />
            <span>Gửi thuốc</span>
          </button>
          <button
            type="reset"
            onClick={() => {
              setForm({
                studentId: 0,
                medicationName: "",
                dosage: "",
                frequency: "",
                instructions: "",
                startDate: "",
                endDate: "",
              });
              setStudentName("");
              setStudentValid(false);
              setSearchResults([]);
            }}
            className="flex items-center space-x-2 bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all"
          >
            <X size={20} />
            <span>Hủy</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicationFormForNurse;
