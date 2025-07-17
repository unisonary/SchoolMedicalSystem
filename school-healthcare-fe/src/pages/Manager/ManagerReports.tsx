import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { 
  FileBarChart2, 
  Filter, 
  Download, 
  Calendar, 
  Users, 
  TrendingUp, 
  Package,
  Activity,
  Syringe,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react";

interface ReportTab {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface Student {
  studentId: number;
  name: string;
  class: string;
} 

const tabs: ReportTab[] = [
  { 
    key: "participation", 
    label: "Báo cáo Tham gia Kế hoạch",
    icon: <Users className="w-4 h-4" />,
    color: "blue"
  },
  { 
    key: "vaccination", 
    label: "Báo cáo Tiêm chủng",
    icon: <Syringe className="w-4 h-4" />,
    color: "green"
  },
  { 
    key: "checkup", 
    label: "Báo cáo Khám sức khỏe",
    icon: <Heart className="w-4 h-4" />,
    color: "red"
  },
  { 
    key: "inventory", 
    label: "Báo cáo Vật tư y tế",
    icon: <Package className="w-4 h-4" />,
    color: "purple"
  },
];

const ManagerReports = () => {
  const [activeTab, setActiveTab] = useState("participation");
  const [grade, setGrade] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState<any[]>([]);

  const [planId, setPlanId] = useState("");
  const [plans, setPlans] = useState<{ planId: number; planName: string }[]>([]);
  const [classOptions, setClassOptions] = useState<string[]>([]);

  const [vaccineName, setVaccineName] = useState("");
  const [vaccineOptions, setVaccineOptions] = useState<string[]>([]);

  useEffect(() => {
    axios
      .get<Student[]>("/manager/assignments/consented-students/all")
      .then((res) => {
        const unique: string[] = Array.from(
          new Set(res.data.filter((s) => s.class).map((s) => s.class))
        ).sort();
        setClassOptions(unique);
      })
      .catch(() => toast.error("Không thể tải danh sách lớp học"));
  }, []);

  useEffect(() => {
    axios
      .get("/manager/plans")
      .then((res) => setPlans(res.data))
      .catch(() => toast.error("Không thể tải danh sách kế hoạch."));
  }, []);

  useEffect(() => {
    // Reset filter khi chuyển tab
    setPlanId("");
    setGrade("");
    setFromDate("");
    setToDate("");
    setData([]);
  }, [activeTab]);

  useEffect(() => {
    setVaccineName("");
    setVaccineOptions([]);
    if (activeTab === "vaccination") {
      axios
        .get<string[]>("/manager/reports/vaccines/names")
        .then((res) => setVaccineOptions(res.data))
        .catch(() => toast.error("Không thể tải danh sách vaccine"));
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      let endpoint = "";
      let payload: any = {};

      switch (activeTab) {
        case "participation":
          endpoint = "/manager/reports/participation";
          payload = planId ? { planId: parseInt(planId) } : {};
          break;
        case "vaccination":
          endpoint = "/manager/reports/vaccination";
          payload = {
            grade,
            fromDate,
            toDate,
            vaccineName: vaccineName || null,
          };
          break;
        case "checkup":
          endpoint = "/manager/reports/health-checkup";
          payload = { grade, fromDate, toDate };
          break;
        case "inventory":
          endpoint = "/manager/reports/inventory";
          payload = { fromExpiryDate: fromDate, toExpiryDate: toDate };
          break;
      }

      const res = await axios.post(endpoint, payload);
      setData(res.data);
    } catch {
      toast.error("Lỗi khi tải báo cáo.");
    }
  };

  const handleExport = async () => {
    try {
      let endpoint = "";
      let payload: any = {};

      switch (activeTab) {
        case "participation":
          endpoint = "/manager/reports/participation/export";
          payload = planId ? { planId: parseInt(planId) } : {};
          break;
        case "vaccination":
          endpoint = "/manager/reports/vaccination/export";
          payload = {
            grade,
            fromDate,
            toDate,
            vaccineName: vaccineName || null,
          };
          break;
        case "checkup":
          endpoint = "/manager/reports/health-checkup/export";
          payload = { grade, fromDate, toDate };
          break;
        case "inventory":
          endpoint = "/manager/reports/inventory/export";
          payload = { fromExpiryDate: fromDate, toExpiryDate: toDate };
          break;
      }

      const res = await axios.post(endpoint, payload, { responseType: "blob" });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeTab}_report.xlsx`;
      a.click();
    } catch {
      toast.error("Xuất báo cáo thất bại.");
    }
  };

  const getAlertIcon = (alertStatus: string) => {
    switch (alertStatus) {
      case "LowStock":
        return <AlertTriangle className="w-4 h-4" />;
      case "ExpirySoon":
        return <Clock className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileBarChart2 className="w-8 h-8 text-purple-600" />
          </div>
          📊 Báo cáo thống kê
        </h2>
        <p className="text-gray-600">Xem và xuất báo cáo thống kê chi tiết</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Chọn loại báo cáo</h3>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all transform hover:scale-105 ${
                activeTab === tab.key
                  ? `bg-${tab.color}-600 text-white border-${tab.color}-600 shadow-lg`
                  : `bg-white hover:bg-${tab.color}-50 text-gray-700 border-gray-200 hover:border-${tab.color}-300`
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Bộ lọc</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* Plan Selection */}
          {activeTab === "participation" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Kế hoạch
              </label>
              <select 
                value={planId} 
                onChange={(e) => setPlanId(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="">-- Tất cả kế hoạch --</option>
                {plans.map((p) => (
                  <option key={p.planId} value={p.planId}>
                    {p.planName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Class Selection */}
          {activeTab !== "inventory" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Lớp học
              </label>
              <select 
                value={grade} 
                onChange={(e) => setGrade(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="">-- Tất cả lớp --</option>
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Vaccine Selection */}
          {activeTab === "vaccination" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Vaccine
              </label>
              <select
                value={vaccineName}
                onChange={(e) => setVaccineName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="">-- Tất cả vaccine --</option>
                {vaccineOptions.map((vaccine) => (
                  <option key={vaccine} value={vaccine}>
                    {vaccine}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Từ ngày
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input 
                type="date" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)} 
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Đến ngày
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input 
                type="date" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)} 
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button 
            onClick={fetchData} 
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            <Filter className="w-4 h-4" />
            <span>Lọc dữ liệu</span>
          </button>
          <button 
            onClick={handleExport} 
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-500" />
              <span>Kết quả báo cáo</span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                {data.length} bản ghi
              </span>
            </h3>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">
                {tabs.find(t => t.key === activeTab)?.label}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {data.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileBarChart2 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Chưa có dữ liệu</p>
              <p className="text-gray-400 text-sm mt-2">Hãy chọn bộ lọc và nhấn "Lọc dữ liệu" để xem báo cáo</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
                <tr>
                  {activeTab === "participation" && (
                    <>
                      <th className="text-left p-4 font-semibold text-gray-700">Tên kế hoạch</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Loại</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Số học sinh mục tiêu</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Số học sinh đồng ý</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Tỷ lệ tham gia (%)</th>
                    </>
                  )}
                  {activeTab === "vaccination" && (
                    <>
                      <th className="text-left p-4 font-semibold text-gray-700">Vaccine</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Lớp</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Số học sinh</th>
                    </>
                  )}
                  {activeTab === "checkup" && (
                    <>
                      <th className="text-left p-4 font-semibold text-gray-700">Loại khám</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Lớp</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Tổng số</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Bất thường</th>
                    </>
                  )}
                  {activeTab === "inventory" && (
                    <>
                      <th className="text-left p-4 font-semibold text-gray-700">Tên vật tư</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Loại</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Số lượng</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Tối thiểu</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Hạn sử dụng</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Cảnh báo</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((item: any, index: number) => (
                  <tr key={index} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    {activeTab === "participation" && (
                      <>
                        <td className="p-4 font-medium text-gray-800">{item.planName}</td>
                        <td className="p-4">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                            {item.planType}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{item.totalStudents}</td>
                        <td className="p-4 text-gray-600">{item.approvedCount}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${Math.min(100, parseFloat(item.participationRate) || 0)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {item.participationRate}%
                            </span>
                          </div>
                        </td>
                      </>
                    )}
                    {activeTab === "vaccination" && (
                      <>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Syringe className="w-4 h-4 text-green-500" />
                            <span className="font-medium text-gray-800">{item.vaccineName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                            {item.grade}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{item.studentCount}</td>
                      </>
                    )}
                    {activeTab === "checkup" && (
                      <>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="font-medium text-gray-800">{item.checkupType}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                            {item.grade}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{item.totalCheckups}</td>
                        <td className="p-4">
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                            {item.abnormalCount}
                          </span>
                        </td>
                      </>
                    )}
                    {activeTab === "inventory" && (
                      <>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-purple-500" />
                            <span className="font-medium text-gray-800">{item.itemName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
                            {item.itemType}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{item.quantity}</td>
                        <td className="p-4 text-gray-600">{item.minimumStockLevel}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{item.expiryDate?.slice(0, 10)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getAlertIcon(item.alertStatus)}
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                item.alertStatus === "LowStock"
                                  ? "bg-red-100 text-red-600"
                                  : item.alertStatus === "ExpirySoon"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {item.alertStatus}
                            </span>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerReports;