import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { format } from "date-fns";
import { Activity, AlertTriangle, Calendar, User, FileText, Shield, AlertCircle } from "lucide-react";

interface MedicalEvent {
  eventId: number;
  date: string;
  description: string;
  severity: string;
  eventType: string;
  nurseName: string;
}

const severityConfig = {
  Low: {
    color: "from-green-50 to-green-100 border-green-200",
    badge: "bg-green-100 text-green-700",
    icon: <Shield className="w-5 h-5 text-green-600" />,
    text: "Nhẹ"
  },
  Medium: {
    color: "from-yellow-50 to-yellow-100 border-yellow-200",
    badge: "bg-yellow-100 text-yellow-800",
    icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    text: "Trung bình"
  },
  High: {
    color: "from-red-50 to-red-100 border-red-200",
    badge: "bg-red-100 text-red-700",
    icon: <AlertCircle className="w-5 h-5 text-red-600" />,
    text: "Nghiêm trọng"
  },
};

const StudentMedicalEvents = () => {
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("/student/health/events");
      setEvents(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy sự kiện y tế:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getSeverityConfig = (severity: string) => {
    return severityConfig[severity as keyof typeof severityConfig] || {
      color: "from-gray-50 to-gray-100 border-gray-200",
      badge: "bg-gray-100 text-gray-700",
      icon: <Activity className="w-5 h-5 text-gray-600" />,
      text: severity
    };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Activity className="w-8 h-8 text-red-600" />
          </div>
          Sự kiện y tế
        </h2>
        <p className="text-gray-600">Theo dõi các sự kiện y tế và tình trạng sức khỏe</p>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-600 text-sm font-medium">Tổng số sự kiện</p>
            <p className="text-3xl font-bold text-red-800">{events.length}</p>
          </div>
          <div className="p-3 bg-red-200 rounded-full">
            <Activity className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <span>📋 Danh sách sự kiện y tế</span>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
              {events.length} sự kiện
            </span>
          </h3>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-gray-400 animate-pulse" />
              </div>
              <p className="text-gray-500 text-lg">Đang tải dữ liệu...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Không có sự kiện y tế nào</p>
              <p className="text-gray-400 text-sm mt-2">Chưa có sự kiện y tế nào được ghi nhận</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.map((ev) => {
                const config = getSeverityConfig(ev.severity);
                return (
                  <div
                    key={ev.eventId}
                    className={`bg-gradient-to-br ${config.color} rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow`}
                  >
                    {/* Event Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {config.icon}
                          <h4 className="text-lg font-bold text-gray-800">
                            {ev.eventType}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(ev.date), "dd/MM/yyyy")}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${config.badge}`}>
                        {config.text}
                      </span>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-3">
                      {/* Description */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start space-x-2">
                          <FileText className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Mô tả:</p>
                            <p className="text-sm text-gray-600">{ev.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Nurse Info */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Ghi nhận bởi:</p>
                            <p className="text-sm text-gray-600">{ev.nurseName}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentMedicalEvents;