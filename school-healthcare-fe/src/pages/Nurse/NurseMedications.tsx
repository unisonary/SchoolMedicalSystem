import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import {
  Pill,
  Calendar,
  Clock,
  Activity,
} from "lucide-react";
import MedicationFormForNurse from "./MedicationFormForNurse";

interface Medication {
  medicationId: number;
  studentName: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  instructions: string;
  startDate: string;
  endDate: string;
  status: string;
  note: string | null;
}

const NurseMedications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<"add" | "active" | "completed">("active");

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/nurse/medications?status=${mode}`);
      setMedications(res.data);
    } catch {
      toast.error("Không thể tải danh sách thuốc.");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (mode === "active" || mode === "completed") {
      fetchMedications();
    }
  }, [mode]);
  

  const handleMarkCompleted = async (id: number) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(id));
      await axios.put(`/nurse/medications/${id}`, { status: "Completed" });
      toast.success("Đã đánh dấu là hoàn tất.");
      fetchMedications();
    } catch {
      toast.error("Lỗi khi cập nhật trạng thái.");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    if (frequency.includes("ngày")) return <Clock className="w-4 h-4 text-blue-500" />;
    if (frequency.includes("tuần")) return <Calendar className="w-4 h-4 text-green-500" />;
    return <Activity className="w-4 h-4 text-orange-500" />;
  };

  const getStatusColor = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const daysDiff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (daysDiff < 0) return "text-red-600 bg-red-100";
    if (daysDiff <= 3) return "text-orange-600 bg-orange-100";
    return "text-green-600 bg-green-100";
  };

  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const daysDiff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (daysDiff < 0) return "Đã hết hạn";
    if (daysDiff === 0) return "Hôm nay";
    if (daysDiff === 1) return "Còn 1 ngày";
    return `Còn ${daysDiff} ngày`;
  };

  const filteredMeds = medications;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">💊 Quản lý thuốc</h2>
        <p className="text-gray-600">Ghi nhận và xử lý thuốc trong trường</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={() => setMode("add")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            mode === "add"
              ? "bg-blue-600 text-white"
              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
          }`}
        >
          ➕ Thêm thuốc
        </button>
        <button
          onClick={() => setMode("active")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            mode === "active"
              ? "bg-green-600 text-white"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          🧪 Đang xử lý
        </button>
        <button
          onClick={() => setMode("completed")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold ${
            mode === "completed"
              ? "bg-gray-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          ✅ Đã xử lý
        </button>
      </div>

      {/* Nội dung từng chế độ */}
      {mode === "add" && (
        <MedicationFormForNurse onSaved={fetchMedications} />
      )}

      {mode === "active" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <Pill className="w-5 h-5 text-purple-500" />
              <span>Danh sách thuốc cần xử lý</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                {filteredMeds.length}
              </span>
            </h3>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">Đang tải dữ liệu...</div>
            ) : filteredMeds.length === 0 ? (
              <p className="text-center text-gray-500">Không có thuốc nào cần xử lý.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 text-left text-sm text-gray-700">
                      <th className="p-4">#</th>
                      <th className="p-4">Học sinh</th>
                      <th className="p-4">Tên thuốc</th>
                      <th className="p-4">Liều</th>
                      <th className="p-4">Tần suất</th>
                      <th className="p-4">Hướng dẫn</th>
                      <th className="p-4">Thời gian</th>
                      <th className="p-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMeds.map((med, index) => (
                      <tr key={med.medicationId} className="border-b hover:bg-gray-50">
                        <td className="p-4">{index + 1}</td>
                        <td className="p-4 font-medium text-gray-700">{med.studentName}</td>
                        <td className="p-4">{med.medicationName}</td>
                        <td className="p-4">{med.dosage}</td>
                        <td className="p-4 flex items-center space-x-1">
                          {getFrequencyIcon(med.frequency)}
                          <span>{med.frequency}</span>
                        </td>
                        <td className="p-4">{med.instructions}</td>
                        <td className="p-4">
                          {new Date(med.startDate).toLocaleDateString("vi-VN")} -{" "}
                          {new Date(med.endDate).toLocaleDateString("vi-VN")}
                          <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${getStatusColor(med.endDate)}`}>
                            {getRemainingDays(med.endDate)}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleMarkCompleted(med.medicationId)}
                            disabled={processingIds.has(med.medicationId)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md text-sm disabled:opacity-50"
                          >
                            {processingIds.has(med.medicationId) ? "Đang xử lý..." : "Đã xử lý"}
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
      )}

      {mode === "completed" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <Pill className="w-5 h-5 text-gray-500" />
              <span>Danh sách thuốc đã xử lý</span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                {filteredMeds.length}
              </span>
            </h3>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">Đang tải dữ liệu...</div>
            ) : filteredMeds.length === 0 ? (
              <p className="text-center text-gray-500">Chưa có thuốc nào được xử lý.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 text-left text-sm text-gray-700">
                      <th className="p-4">#</th>
                      <th className="p-4">Học sinh</th>
                      <th className="p-4">Tên thuốc</th>
                      <th className="p-4">Liều</th>
                      <th className="p-4">Tần suất</th>
                      <th className="p-4">Hướng dẫn</th>
                      <th className="p-4">Thời gian</th>
                      <th className="p-4">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMeds.map((med, index) => (
                      <tr key={med.medicationId} className="border-b hover:bg-gray-50">
                        <td className="p-4">{index + 1}</td>
                        <td className="p-4 font-medium text-gray-700">{med.studentName}</td>
                        <td className="p-4">{med.medicationName}</td>
                        <td className="p-4">{med.dosage}</td>
                        <td className="p-4 flex items-center space-x-1">
                          {getFrequencyIcon(med.frequency)}
                          <span>{med.frequency}</span>
                        </td>
                        <td className="p-4">{med.instructions}</td>
                        <td className="p-4">
                          {new Date(med.startDate).toLocaleDateString("vi-VN")} -{" "}
                          {new Date(med.endDate).toLocaleDateString("vi-VN")}
                          <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${getStatusColor(med.endDate)}`}>
                            {getRemainingDays(med.endDate)}
                          </div>
                        </td>
                        <td className="p-4">{med.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseMedications;
