import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { FileBarChart2 } from "lucide-react";

interface ReportTab {
  key: string;
  label: string;
}
interface Student {
  studentId: number;
  name: string;
  class: string;
} 
const tabs: ReportTab[] = [
  { key: "participation", label: "Báo cáo Tham gia Kế hoạch" },
  { key: "vaccination", label: "Báo cáo Tiêm chủng" },
  { key: "checkup", label: "Báo cáo Khám sức khỏe" },
  { key: "inventory", label: "Báo cáo Vật tư y tế" },
];

const ManagerReports = () => {
  const [activeTab, setActiveTab] = useState("participation");
  const [grade, setGrade] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState<any[]>([]); // dùng any[] vì mỗi tab có kiểu khác

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

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
        <FileBarChart2 className="text-purple-500" />
        Báo cáo thống kê
      </h2>

      <div className="flex gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium border ${
              activeTab === tab.key
                ? "bg-purple-600 text-white"
                : "bg-white hover:bg-purple-50 text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {activeTab === "participation" && (
          <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="input">
            <option value="">-- Tất cả kế hoạch --</option>
            {plans.map((p) => (
              <option key={p.planId} value={p.planId}>
                {p.planName}
              </option>
            ))}
          </select>
        )}

        {activeTab !== "inventory" && (
          <select value={grade} onChange={(e) => setGrade(e.target.value)} className="input">
            <option value="">-- Tất cả lớp --</option>
            {classOptions.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        )}

        {/* ✅ CHÈN Ở ĐÂY */}
        {activeTab === "vaccination" && (
          <select
            value={vaccineName}
            onChange={(e) => setVaccineName(e.target.value)}
            className="input"
          >
            <option value="">-- Tất cả vaccine --</option>
            {vaccineOptions.map((vaccine) => (
              <option key={vaccine} value={vaccine}>
                {vaccine}
              </option>
            ))}
          </select>
        )}

        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input" />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input" />

        <div className="flex gap-2">
          <button onClick={fetchData} className="btn-purple">Lọc</button>
          <button onClick={handleExport} className="btn-green">Xuất Excel</button>
        </div>
      </div>


      {/* Table */}
      <div className="overflow-x-auto bg-white border rounded-lg shadow">
        <table className="table-auto w-full text-sm">
          <thead className="bg-purple-50">
            <tr>
              {activeTab === "participation" && (
                <>
                  <th className="th">Tên kế hoạch</th>
                  <th className="th">Loại</th>
                  <th className="th">Số học sinh mục tiêu</th>
                  <th className="th">Số học sinh đồng ý</th>
                  <th className="th">Tỷ lệ tham gia (%)</th>
                </>
              )}
              {activeTab === "vaccination" && (
                <>
                  <th className="th">Vaccine</th>
                  <th className="th">Lớp</th>
                  <th className="th">Số học sinh</th>
                </>
              )}
              {activeTab === "checkup" && (
                <>
                  <th className="th">Loại khám</th>
                  <th className="th">Lớp</th>
                  <th className="th">Tổng số</th>
                  <th className="th">Bất thường</th>
                </>
              )}
              {activeTab === "inventory" && (
                <>
                  <th className="th">Tên vật tư</th>
                  <th className="th">Loại</th>
                  <th className="th">Số lượng</th>
                  <th className="th">Tối thiểu</th>
                  <th className="th">Hạn sử dụng</th>
                  <th className="th">Cảnh báo</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="td text-center text-gray-500">
                  Chưa có dữ liệu
                </td>
              </tr>
            ) : (
              data.map((item: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  {activeTab === "participation" && (
                    <>
                      <td className="td">{item.planName}</td>
                      <td className="td">{item.planType}</td>
                      <td className="td">{item.totalStudents}</td>
                      <td className="td">{item.approvedCount}</td>
                      <td className="td">{item.participationRate}</td>
                    </>
                  )}
                  {activeTab === "vaccination" && (
                    <>
                      <td className="td">{item.vaccineName}</td>
                      <td className="td">{item.grade}</td>
                      <td className="td">{item.studentCount}</td>
                    </>
                  )}
                  {activeTab === "checkup" && (
                    <>
                      <td className="td">{item.checkupType}</td>
                      <td className="td">{item.grade}</td>
                      <td className="td">{item.totalCheckups}</td>
                      <td className="td">{item.abnormalCount}</td>
                    </>
                  )}
                  {activeTab === "inventory" && (
                    <>
                      <td className="td">{item.itemName}</td>
                      <td className="td">{item.itemType}</td>
                      <td className="td">{item.quantity}</td>
                      <td className="td">{item.minimumStockLevel}</td>
                      <td className="td">{item.expiryDate?.slice(0, 10)}</td>
                      <td className="td">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.alertStatus === "LowStock"
                              ? "bg-red-100 text-red-600"
                              : item.alertStatus === "ExpirySoon"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {item.alertStatus}
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerReports;
