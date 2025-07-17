import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { format } from "date-fns";
import { Heart, Calendar, User, FileText, CheckCircle, AlertCircle } from "lucide-react";

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

  const getResultIcon = (result: string) => {
    if (result.toLowerCase().includes('tốt') || result.toLowerCase().includes('bình thường')) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  };

  const getResultColor = (result: string) => {
    if (result.toLowerCase().includes('tốt') || result.toLowerCase().includes('bình thường')) {
      return 'from-green-50 to-green-100 border-green-200';
    }
    return 'from-yellow-50 to-yellow-100 border-yellow-200';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Heart className="w-8 h-8 text-pink-600" />
          </div>
          Kết quả khám sức khỏe
        </h2>
        <p className="text-gray-600">Theo dõi lịch sử khám sức khỏe định kỳ của bạn</p>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-pink-600 text-sm font-medium">Tổng số lần khám</p>
            <p className="text-3xl font-bold text-pink-800">{checkups.length}</p>
          </div>
          <div className="p-3 bg-pink-200 rounded-full">
            <Heart className="w-6 h-6 text-pink-600" />
          </div>
        </div>
      </div>

      {/* Checkups List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <span>📋 Lịch sử khám sức khỏe</span>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
              {checkups.length} lần khám
            </span>
          </h3>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400 animate-pulse" />
              </div>
              <p className="text-gray-500 text-lg">Đang tải dữ liệu...</p>
            </div>
          ) : checkups.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Chưa có dữ liệu khám sức khỏe</p>
              <p className="text-gray-400 text-sm mt-2">Bạn chưa có lịch sử khám sức khỏe nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {checkups.map((c) => (
                <div 
                  key={c.checkupId} 
                  className={`bg-gradient-to-br ${getResultColor(c.result)} rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow`}
                >
                  {/* Checkup Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getResultIcon(c.result)}
                        <h4 className="text-lg font-bold text-gray-800">
                          {c.checkupType}
                        </h4>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(c.date), "dd/MM/yyyy")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkup Details */}
                  <div className="space-y-3">
                    {/* Result */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Kết quả:</p>
                          <p className="text-sm text-gray-600">{c.result}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recommendations */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Khuyến nghị:</p>
                          <p className="text-sm text-gray-600">
                            {c.recommendations || (
                              <span className="italic text-gray-400">Không có khuyến nghị đặc biệt</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Nurse Info */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Người khám:</p>
                          <p className="text-sm text-gray-600">{c.nurseName}</p>
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

export default StudentCheckups;