import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { format } from "date-fns";
import { toast } from "react-toastify";

interface Vaccination {
  vaccinationId: number;
  vaccineName: string;
  date: string;
  nurseName: string;
  reaction?: string;
  nextDoseDue?: string;
}

const StudentVaccinations = () => {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVaccinations();
  }, []);

  const fetchVaccinations = async () => {
    try {
      const res = await axios.get("/student/health/vaccinations");
      setVaccinations(res.data);
    } catch (err) {
      toast.error("Không thể tải dữ liệu tiêm chủng.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Không rõ";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy");
    } catch {
      return "Không hợp lệ";
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-600">Đang tải dữ liệu...</div>;
  }

  if (vaccinations.length === 0) {
    return <div className="text-sm text-gray-500 italic">Chưa có dữ liệu tiêm chủng.</div>;
  }

  return (
    <div className="overflow-x-auto text-sm">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2 border">Tên vắc xin</th>
            <th className="px-4 py-2 border">Ngày tiêm</th>
            <th className="px-4 py-2 border">Phản ứng</th>
            <th className="px-4 py-2 border">Liều tiếp theo</th>
            <th className="px-4 py-2 border">Y tá phụ trách</th>
          </tr>
        </thead>
        <tbody>
          {vaccinations.map((item) => (
            <tr key={item.vaccinationId} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{item.vaccineName}</td>
              <td className="px-4 py-2 border">{formatDate(item.date)}</td>
              <td className="px-4 py-2 border">{item.reaction || "Không"}</td>
              <td className="px-4 py-2 border">{formatDate(item.nextDoseDue)}</td>
              <td className="px-4 py-2 border">{item.nurseName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentVaccinations;
