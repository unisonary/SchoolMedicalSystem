import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Syringe, Calendar, User, FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react";

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

  const getReactionIcon = (reaction?: string) => {
    if (!reaction || reaction === "Không") {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
  };

  const getReactionColor = (reaction?: string) => {
    if (!reaction || reaction === "Không") {
      return "from-green-50 to-green-100 border-green-200";
    }
    return "from-yellow-50 to-yellow-100 border-yellow-200";
  };

  const isNextDoseDue = (dateStr?: string) => {
    if (!dateStr) return false;
    try {
      const dueDate = new Date(dateStr);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0; // Due within 30 days
    } catch {
      return false;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Syringe className="w-8 h-8 text-blue-600" />
          </div>
          Lịch sử tiêm chủng
        </h2>
        <p className="text-gray-600">Theo dõi lịch sử tiêm chủng và lịch tiêm sắp tới</p>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-600 text-sm font-medium">Tổng số mũi tiêm</p>
            <p className="text-3xl font-bold text-blue-800">{vaccinations.length}</p>
          </div>
          <div className="p-3 bg-blue-200 rounded-full">
            <Syringe className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Vaccinations List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <span>📋 Danh sách tiêm chủng</span>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
              {vaccinations.length} mũi tiêm
            </span>
          </h3>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Syringe className="w-8 h-8 text-gray-400 animate-pulse" />
              </div>
              <p className="text-gray-500 text-lg">Đang tải dữ liệu...</p>
            </div>
          ) : vaccinations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Syringe className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Chưa có dữ liệu tiêm chủng</p>
              <p className="text-gray-400 text-sm mt-2">Bạn chưa có lịch sử tiêm chủng nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {vaccinations.map((item) => (
                <div
                  key={item.vaccinationId}
                  className={`bg-gradient-to-br ${getReactionColor(item.reaction)} rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow`}
                >
                  {/* Vaccination Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Syringe className="w-5 h-5 text-blue-600" />
                        <h4 className="text-lg font-bold text-gray-800">
                          {item.vaccineName}
                        </h4>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(item.date)}</span>
                      </div>
                    </div>
                    {isNextDoseDue(item.nextDoseDue) && (
                      <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-medium">
                        Sắp đến hạn
                      </span>
                    )}
                  </div>

                  {/* Vaccination Details */}
                  <div className="space-y-3">
                    {/* Reaction */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start space-x-2">
                        {getReactionIcon(item.reaction)}
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Phản ứng:</p>
                          <p className="text-sm text-gray-600">
                            {item.reaction || "Không có phản ứng"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Next Dose */}
                    {item.nextDoseDue && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start space-x-2">
                          <Clock className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Liều tiếp theo:</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(item.nextDoseDue)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Nurse Info */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Y tá phụ trách:</p>
                          <p className="text-sm text-gray-600">{item.nurseName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentVaccinations;