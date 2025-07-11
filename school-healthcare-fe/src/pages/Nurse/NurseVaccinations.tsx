import { useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { 
  Syringe, 
  Search, 
  Users, 
  FileText, 
  CheckCircle2, 
  RefreshCw,
  Shield,
  Clock,
  Save
} from "lucide-react";

interface Vaccination {
  vaccinationId: number;
  studentName: string;
  vaccineName: string;
  batchNumber: string;
  date: string | null;
  reaction: string;
  nextDoseDue: string | null;
}

const NurseVaccination = () => {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [formMap, setFormMap] = useState<Record<number, Partial<Vaccination>>>({});
  const [planId, setPlanId] = useState<number | null>(null);
  const [inputPlanId, setInputPlanId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  const fetchVaccinations = async () => {
    if (!inputPlanId || isNaN(Number(inputPlanId))) {
      toast.error("Vui lòng nhập mã kế hoạch hợp lệ.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`/nurse/vaccinations`, {
        params: { planId: inputPlanId },
      });
      const filtered = res.data.filter((v: any) => !v.vaccineName || v.vaccineName.trim() === "");
      setVaccinations(filtered);
      setPlanId(Number(inputPlanId));
    } catch {
      toast.error("Không thể tải danh sách tiêm chủng.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: number, field: string, value: string) => {
    setFormMap((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleUpdate = async (id: number) => {
    const form = formMap[id];
    if (!form?.vaccineName || !form.batchNumber) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      setProcessingIds(prev => new Set(prev).add(id));
      await axios.put(`/nurse/vaccinations/${id}`, form);
      toast.success("Cập nhật kết quả tiêm thành công");
      setVaccinations((prev) => prev.filter((v) => v.vaccinationId !== id));
    } catch {
      toast.error("Lỗi khi cập nhật.");
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">💉 Quản lý tiêm chủng</h2>
        <p className="text-gray-600">Theo dõi và cập nhật kết quả tiêm chủng cho học sinh</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Học sinh cần tiêm</h3>
              <p className="text-2xl font-bold text-blue-600">{vaccinations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Kế hoạch hiện tại</h3>
              <p className="text-2xl font-bold text-green-600">{planId || "Chưa chọn"}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <Syringe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-800">Đã hoàn thành</h3>
              <p className="text-2xl font-bold text-purple-600">
                {Object.keys(formMap).filter(id => formMap[Number(id)]?.vaccineName && formMap[Number(id)]?.batchNumber).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 -mx-6 -mt-6 mb-6 rounded-t-xl border-b">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Search className="w-5 h-5 text-blue-500" />
            <span>Tìm kế hoạch tiêm chủng</span>
          </h3>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="number"
              placeholder="Nhập mã kế hoạch tiêm chủng..."
              value={inputPlanId}
              onChange={(e) => setInputPlanId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
          </div>
          <button
            onClick={fetchVaccinations}
            disabled={loading}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? "Đang tải..." : "Tải danh sách"}</span>
          </button>
        </div>
      </div>

      {/* Vaccination Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Syringe className="w-5 h-5 text-purple-500" />
            <span>Danh sách học sinh cần tiêm</span>
            {planId && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                Kế hoạch #{planId}
              </span>
            )}
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
              {vaccinations.length}
            </span>
          </h3>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
              <p className="text-gray-500 text-lg">Đang tải dữ liệu...</p>
            </div>
          ) : vaccinations.length === 0 && planId ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Không có học sinh nào cần cập nhật</p>
              <p className="text-gray-400 text-sm mt-2">Tất cả học sinh đã được tiêm chủng hoặc chưa có yêu cầu mới</p>
            </div>
          ) : vaccinations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Vui lòng nhập mã kế hoạch để tải danh sách</p>
              <p className="text-gray-400 text-sm mt-2">Nhập mã kế hoạch tiêm chủng để xem danh sách học sinh cần tiêm</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-700">STT</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Học sinh</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Tên vắc xin</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Số lô</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Phản ứng</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Liều tiếp theo</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccinations.map((v, index) => (
                    <tr key={v.vaccinationId} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <td className="p-4 font-medium text-gray-600">{index + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {v.studentName.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800">{v.studentName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="relative">
                          <input
                            value={formMap[v.vaccinationId]?.vaccineName || ""}
                            onChange={(e) => handleChange(v.vaccinationId, "vaccineName", e.target.value)}
                            placeholder="Nhập tên vắc xin..."
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                          />
                          <Syringe className="absolute right-2 top-2.5 w-4 h-4 text-gray-400" />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="relative">
                          <input
                            value={formMap[v.vaccinationId]?.batchNumber || ""}
                            onChange={(e) => handleChange(v.vaccinationId, "batchNumber", e.target.value)}
                            placeholder="Nhập số lô..."
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          />
                          <FileText className="absolute right-2 top-2.5 w-4 h-4 text-gray-400" />
                        </div>
                      </td>
                      <td className="p-4">
                        <input
                          value={formMap[v.vaccinationId]?.reaction || ""}
                          onChange={(e) => handleChange(v.vaccinationId, "reaction", e.target.value)}
                          placeholder="Ghi chú phản ứng..."
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        />
                      </td>
                      <td className="p-4">
                        <div className="relative">
                          <input
                            type="datetime-local"
                            value={formMap[v.vaccinationId]?.nextDoseDue || ""}
                            onChange={(e) => handleChange(v.vaccinationId, "nextDoseDue", e.target.value)}
                            min={new Date(Date.now() + 86400000).toISOString().slice(0, 16)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                          />
                          <Clock className="absolute right-2 top-2.5 w-4 h-4 text-gray-400" />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleUpdate(v.vaccinationId)}
                            disabled={processingIds.has(v.vaccinationId)}
                            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            {processingIds.has(v.vaccinationId) ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            <span className="text-sm">
                              {processingIds.has(v.vaccinationId) ? "Đang lưu..." : "Lưu"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NurseVaccination;