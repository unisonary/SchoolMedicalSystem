import { useState, useEffect  } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { Activity, User, CheckCircle, Search, RefreshCw, Stethoscope, Eye, Ear, Smile, TrendingUp, Save, Heart } from "lucide-react";

interface HealthCheckup {
  checkupId: number;
  studentName: string;
  checkupType: string;
  result: string;
  abnormalFindings: string;
  recommendations: string;
  date: string;
}

interface Plan {
  planId: number;
  planName: string;
}


const NurseHealthCheckup = () => {
  const [checkups, setCheckups] = useState<HealthCheckup[]>([]);
  const [formMap, setFormMap] = useState<Record<number, Partial<HealthCheckup> & { followUpRequired?: boolean }>>({});
  const [planId, setPlanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [planNameInput, setPlanNameInput] = useState("");
  const [suggestions, setSuggestions] = useState<Plan[]>([]);
  const [selectedPlanName, setSelectedPlanName] = useState("");
  


  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get("nurse/checkups/plans/health-checkup-names");
        setSuggestions(res.data);
      } catch {
        toast.error("Không thể tải danh sách kế hoạch");
      }
    };
  
    fetchPlans();
  }, []);
  

  const fetchCheckups = async () => {
    if (!selectedPlanName) {
      toast.error("Vui lòng chọn kế hoạch hợp lệ");
      return;
    }
  
    try {
      setLoading(true);
      const res = await axios.get(
        `/nurse/checkups/by-plan-name?planName=${encodeURIComponent(selectedPlanName)}`
      );
      const filtered = res.data.filter((item: any) => !item.result || item.result.trim() === "");
      setCheckups(filtered);
  
      if (filtered.length === 0) {
        toast.info("Không có dữ liệu kiểm tra cần cập nhật");
      }
  
      // lấy PlanId từ backend nếu cần gắn lên giao diện
      const found = suggestions.find(p => p.planName === selectedPlanName);
      if (found) setPlanId(found.planId);
    } catch {
      toast.error("Không thể tải danh sách kiểm tra.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleChange = (id: number, field: string, value: string | boolean) => {
    setFormMap((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleUpdate = async (id: number) => {
    const form = formMap[id];
    if (!form?.checkupType || !form.result) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      await axios.put(`/nurse/checkups/${id}`, form);
      toast.success(`✅ Đã cập nhật kết quả khám thành công`);

      setCheckups((prev) => prev.filter((c) => c.checkupId !== id));
      setFormMap((prev) => {
        const { [id]: removed, ...rest } = prev;
        return rest;
      });
    } catch {
      toast.error("❌ Lỗi khi cập nhật.");
    }
  };

  const getCheckupTypeIcon = (type: string) => {
    switch (type) {
      case "Annual": return <Heart className="w-4 h-4 text-red-500" />;
      case "Vision": return <Eye className="w-4 h-4 text-blue-500" />;
      case "Hearing": return <Ear className="w-4 h-4 text-green-500" />;
      case "Dental": return <Smile className="w-4 h-4 text-purple-500" />;
      case "Growth": return <TrendingUp className="w-4 h-4 text-orange-500" />;
      default: return <Stethoscope className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCheckupTypeName = (type: string) => {
    switch (type) {
      case "Annual": return "Khám sức khỏe tổng quát";
      case "Vision": return "Khám thị lực";
      case "Hearing": return "Khám thính lực";
      case "Dental": return "Khám răng miệng";
      case "Growth": return "Đo tăng trưởng";
      default: return type;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          🩺 Kiểm tra sức khỏe học sinh
        </h2>
        <p className="text-gray-600">
          Cập nhật kết quả khám sức khỏe cho học sinh theo kế hoạch
          {planId && (
            <span className="ml-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Kế hoạch #{planId}
            </span>
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Học sinh cần khám</h3>
              <p className="text-2xl font-bold text-blue-600">{checkups.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Đã hoàn thành</h3>
              <p className="text-2xl font-bold text-green-600">
                {Object.keys(formMap).filter(id => formMap[Number(id)]?.result).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-800">Cần theo dõi</h3>
              <p className="text-2xl font-bold text-orange-600">
                {Object.keys(formMap).filter(id => formMap[Number(id)]?.followUpRequired).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Search className="w-5 h-5 text-blue-500" />
            <span>Tìm kiếm kế hoạch khám</span>
          </h3>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4">
          <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tên kế hoạch khám sức khỏe
          </label>
          <input
            type="text"
            placeholder="Nhập tên kế hoạch (ví dụ: Khám sức khỏe tháng 7)"
            value={planNameInput}
            onChange={(e) => {
              setPlanNameInput(e.target.value);
              setSelectedPlanName(""); // clear nếu đang gõ lại
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {planNameInput && (
            <ul className="mt-1 border rounded bg-white shadow max-h-48 overflow-auto z-10 relative">
              {suggestions
                .filter(p =>
                  p.planName.toLowerCase().includes(planNameInput.toLowerCase())
                )
                .slice(0, 5)
                .map((plan) => (
                  <li
                    key={plan.planId}
                    onClick={() => {
                      setSelectedPlanName(plan.planName);
                      setPlanNameInput(plan.planName);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                  >
                    {plan.planName}
                  </li>
                ))}
            </ul>
          )}
          </div>

            <div className="flex-shrink-0 mt-7">
              <button
                onClick={fetchCheckups}
                disabled={loading}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? "Đang tải..." : "Tải danh sách"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Health Checkup Table */}
      {planId && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-purple-500" />
              <span>Danh sách kiểm tra sức khỏe</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                {checkups.length}
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
            ) : checkups.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">Không có dữ liệu kiểm tra cần cập nhật</p>
                <p className="text-gray-400 text-sm mt-2">
                  Tất cả học sinh trong kế hoạch này đã được khám xong
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left p-4 font-semibold text-gray-700">STT</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Học sinh</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Loại khám</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Kết quả</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Bất thường</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Khuyến nghị</th>
                      <th className="text-center p-4 font-semibold text-gray-700">Theo dõi</th>
                      <th className="text-center p-4 font-semibold text-gray-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkups.map((c, index) => (
                      <tr key={c.checkupId} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="p-4 font-medium text-gray-600">{index + 1}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {c.studentName.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-800">{c.studentName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <select
                            value={formMap[c.checkupId]?.checkupType || ""}
                            onChange={(e) => handleChange(c.checkupId, "checkupType", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          >
                            <option value="">-- Chọn loại khám --</option>
                            <option value="Annual">Khám sức khỏe tổng quát</option>
                            <option value="Vision">Khám thị lực</option>
                            <option value="Hearing">Khám thính lực</option>
                            <option value="Dental">Khám răng miệng</option>
                            <option value="Growth">Đo tăng trưởng</option>
                          </select>
                          {formMap[c.checkupId]?.checkupType && (
                            <div className="flex items-center space-x-2 mt-2">
                              {getCheckupTypeIcon(formMap[c.checkupId]?.checkupType || "")}
                              <span className="text-sm text-gray-600">
                                {getCheckupTypeName(formMap[c.checkupId]?.checkupType || "")}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <textarea
                            value={formMap[c.checkupId]?.result || ""}
                            onChange={(e) => handleChange(c.checkupId, "result", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            rows={2}
                            placeholder="Nhập kết quả khám..."
                          />
                        </td>
                        <td className="p-4">
                          <textarea
                            value={formMap[c.checkupId]?.abnormalFindings || ""}
                            onChange={(e) => handleChange(c.checkupId, "abnormalFindings", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            rows={2}
                            placeholder="Ghi chú bất thường (nếu có)..."
                          />
                        </td>
                        <td className="p-4">
                          <textarea
                            value={formMap[c.checkupId]?.recommendations || ""}
                            onChange={(e) => handleChange(c.checkupId, "recommendations", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            rows={2}
                            placeholder="Khuyến nghị cho học sinh..."
                          />
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center space-y-2">
                            <input
                              type="checkbox"
                              checked={formMap[c.checkupId]?.followUpRequired || false}
                              onChange={(e) => handleChange(c.checkupId, "followUpRequired", e.target.checked)}
                              className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                            />
                            <span className="text-xs text-gray-600">Cần theo dõi</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleUpdate(c.checkupId)}
                              disabled={!formMap[c.checkupId]?.checkupType || !formMap[c.checkupId]?.result}
                              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Save className="w-4 h-4" />
                              <span>Lưu</span>
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
      )}
    </div>
  );
};

export default NurseHealthCheckup;