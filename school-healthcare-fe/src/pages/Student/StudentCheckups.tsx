import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { format } from "date-fns";

interface HealthCheckup {
  checkupId: number;
  checkupType: string;
  date: string;
  result: string;
  recommendations: string;
  nurseName: string;
}

const StudentCheckups = () => {
  const [checkups, setCheckups] = useState<HealthCheckup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCheckups = async () => {
    try {
      const response = await axios.get("/student/health/checkups");
      setCheckups(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khám sức khỏe:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckups();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Kết quả khám sức khỏe</h3>

      {loading ? (
        <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
      ) : checkups.length === 0 ? (
        <p className="text-sm text-gray-500 italic">Chưa có dữ liệu khám sức khỏe.</p>
      ) : (
        <div className="space-y-4">
          {checkups.map((c) => (
            <div
              key={c.checkupId}
              className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-blue-600">
                  {c.checkupType}
                </span>
                <span className="text-xs text-gray-500">
                  Ngày: {format(new Date(c.date), "dd/MM/yyyy")}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                <strong>Kết quả:</strong> {c.result}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Khuyến nghị:</strong>{" "}
                {c.recommendations || <span className="italic text-gray-400">Không có</span>}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Người khám: {c.nurseName}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCheckups;
