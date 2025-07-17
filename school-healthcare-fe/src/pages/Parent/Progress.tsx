// src/pages/parent/Progress.tsx

import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { Activity, HeartPulse, Stethoscope, User, Calendar, ClipboardList } from "lucide-react";

interface MedicalEvent {
  eventId: number;
  studentName: string;
  eventType: string;
  description: string;
  date: string;
  nurseName: string;
}

interface HealthCheckup {
  checkupId: number;
  studentName: string;
  result: string;
  date: string;
  recommendations: string;
}

const Progress = () => {
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [checkups, setCheckups] = useState<HealthCheckup[]>([]);

  useEffect(() => {
    axios.get("/parent/student/events").then((res) => setEvents(res.data));
    axios.get("/parent/student/checkups").then((res) => setCheckups(res.data));
  }, []);

  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
          <Activity className="w-8 h-8 text-blue-600" />
          Theo dõi sức khỏe
        </h2>
        <p className="text-gray-600 mt-2">Tổng hợp sự kiện y tế và kết quả khám sức khỏe của học sinh</p>
      </div>

      {/* Medical Events */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
          <HeartPulse className="text-blue-500" /> Sự kiện y tế
        </h3>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          {events.length === 0 ? (
            <p className="italic text-gray-500 text-center py-4">Không có sự kiện y tế nào.</p>
          ) : (
            events.map((e) => (
              <div key={e.eventId} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{e.eventType} - {e.studentName}</p>
                    <p className="text-sm text-gray-600">{e.description}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-4 mt-3 pl-14">
                  <span className="flex items-center gap-1.5"><User size={12} /> Y tá: {e.nurseName}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(e.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Health Checkups */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
          <Stethoscope className="text-blue-500" /> Kết quả khám sức khỏe
        </h3>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          {checkups.length === 0 ? (
            <p className="italic text-gray-500 text-center py-4">Chưa có dữ liệu khám sức khỏe.</p>
          ) : (
            checkups.map((c) => (
              <div key={c.checkupId} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <ClipboardList className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Kết quả khám: {c.result}</p>
                    <p className="text-sm text-gray-600">Đề xuất: {c.recommendations}</p>
                  </div>
                </div>
                 <div className="text-xs text-gray-500 flex items-center gap-4 mt-3 pl-14">
                  <span className="flex items-center gap-1.5"><User size={12} /> Học sinh: {c.studentName}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(c.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;