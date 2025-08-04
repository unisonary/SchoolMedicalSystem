import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { Save, X, Pill, Calendar, FileText, Upload, Link2 } from "lucide-react";

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
    prescriptionImageUrl: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (editingData) {
      setForm({
        medicationName: editingData.medicationName || "",
        dosage: editingData.dosage || "",
        frequency: editingData.frequency || "",
        instructions: editingData.instructions || "",
        startDate: editingData.startDate ? editingData.startDate.split("T")[0] : "",
        endDate: editingData.endDate ? editingData.endDate.split("T")[0] : "",
        prescriptionImageUrl: editingData.prescriptionImageUrl || "",
      });
    } else {
      handleCancel();
    }
  }, [editingData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setForm(prev => ({ ...prev, prescriptionImageUrl: "" })); // Xóa URL cũ nếu chọn file mới
    }
  };

  const uploadToCloudinary = async (fileToUpload: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", fileToUpload);
    // ❗️ QUAN TRỌNG: Thay thế "your_unsigned_preset" bằng Upload Preset của bạn trên Cloudinary
    formData.append("upload_preset", "my_unsigned_preset");

    try {
      setIsUploading(true);
      // ❗️ QUAN TRỌNG: Thay thế "your_cloud_name" bằng Cloud Name của bạn
      const res = await fetch("https://api.cloudinary.com/v1_1/dkodv14qy/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        toast.success("Tải ảnh lên thành công!");
        return data.secure_url;
      }
      throw new Error(data.error?.message || "Upload không thành công.");
    } catch (err: any) {
      toast.error(`Upload ảnh thất bại: ${err.message}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.medicationName || !form.dosage || !form.frequency || !form.startDate || !form.endDate) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
    if (form.endDate < form.startDate) {
      toast.error("Ngày kết thúc không được trước ngày bắt đầu.");
      return;
    }

    try {
      setIsSubmitting(true);
      let finalImageUrl = form.prescriptionImageUrl;

      if (file) {
        const uploadedUrl = await uploadToCloudinary(file);
        if (!uploadedUrl) {
          setIsSubmitting(false);
          return;
        }
        finalImageUrl = uploadedUrl;
      }

      if (editingData) {
        // SỬA LỖI: Khi cập nhật, chỉ gửi các trường cần thiết, không gửi studentId
        const updatePayload = {
            medicationName: form.medicationName,
            dosage: form.dosage,
            frequency: form.frequency,
            instructions: form.instructions,
            startDate: form.startDate,
            endDate: form.endDate,
            prescriptionImageUrl: finalImageUrl,
        };
        await axios.put(`/parent/health/medication/${editingData.medicationId}`, updatePayload);
        toast.success("Cập nhật yêu cầu thành công!");
      } else {
        const createPayload = { ...form, studentId, prescriptionImageUrl: finalImageUrl };
        await axios.post("/parent/health/medication", createPayload);
        toast.success("Đã gửi yêu cầu. Vui lòng chờ y tá xác nhận.");
      }
      onSaved(); // Gọi hàm để tải lại danh sách và xóa form
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi gửi thông tin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setForm({
      medicationName: "", dosage: "", frequency: "",
      instructions: "", startDate: "", endDate: "", prescriptionImageUrl: ""
    });
    setFile(null);
    clearEditing();
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
          <Pill className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            {editingData ? "Chỉnh sửa yêu cầu gửi thuốc" : "Gửi thuốc mới cho học sinh"}
          </h3>
          <p className="text-sm text-gray-600">Điền đầy đủ thông tin để gửi yêu cầu cho nhà trường</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <Pill size={16} className="text-green-600" />
              <span>Tên thuốc <span className="text-red-500">*</span></span>
            </label>
            <input type="text" required placeholder="Ví dụ: Paracetamol, Vitamin C..." className="w-full p-3 border-2 border-gray-200 rounded-xl" value={form.medicationName} onChange={(e) => setForm({ ...form, medicationName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
              <span>Liều dùng <span className="text-red-500">*</span></span>
            </label>
            <select required value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} className="w-full p-3 border-2 border-gray-200 rounded-xl">
              <option value="">-- Chọn liều dùng --</option>
              {dosageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
              <span>Tần suất sử dụng <span className="text-red-500">*</span></span>
            </label>
            <select required value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="w-full p-3 border-2 border-gray-200 rounded-xl">
              <option value="">-- Chọn tần suất --</option>
              {frequencyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <FileText size={16} className="text-orange-600" />
              <span>Hướng dẫn sử dụng</span>
            </label>
            <input type="text" placeholder="Ví dụ: Uống sau ăn, uống với nước ấm..." className="w-full p-3 border-2 border-gray-200 rounded-xl" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <Calendar size={16} className="text-blue-600" />
              <span>Ngày bắt đầu <span className="text-red-500">*</span></span>
            </label>
            <input type="date" required min={today} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full p-3 border-2 border-gray-200 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <Calendar size={16} className="text-red-600" />
              <span>Ngày kết thúc <span className="text-red-500">*</span></span>
            </label>
            <input type="date" required min={form.startDate || today} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full p-3 border-2 border-gray-200 rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
            <Upload size={16} className="text-blue-600" />
            <span>Ảnh toa thuốc (không bắt buộc)</span>
          </label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border-2 border-gray-200 rounded-xl cursor-pointer" />
          {isUploading && <p className="text-xs text-blue-600 animate-pulse">Đang tải ảnh lên...</p>}
          {file && <p className="text-xs text-gray-600 mt-1">Đã chọn: {file.name}</p>}
          {form.prescriptionImageUrl && !file && (
            <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
              <Link2 size={14} />
              <a href={form.prescriptionImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Xem ảnh hiện tại</a>
            </div>
          )}
        </div>

        <div className="flex space-x-4 pt-4 border-t border-gray-200">
          <button type="submit" disabled={isSubmitting || isUploading} className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50">
            <Save size={20} />
            <span>{isSubmitting ? "Đang gửi..." : editingData ? "Cập nhật" : "Gửi yêu cầu"}</span>
          </button>
          {editingData && (
            <button type="button" onClick={handleCancel} className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-xl transition-all">
              <X size={20} />
              <span>Hủy</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MedicationForm;