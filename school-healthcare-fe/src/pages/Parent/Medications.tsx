import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { Pencil, Pill, Clock, CheckCircle, AlertCircle, Calendar, XCircle, FileImage } from "lucide-react";
import Tabs from "@/components/ui/Tabs";
import MedicationForm from "./MedicationForm";
// import MedicationForm from "./MedicationForm"; // Đã import ở trên

interface Medication {
  medicationId: number;
  studentId: number;
  studentName: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  instructions: string;
  startDate: string;
  endDate: string;
  status: string;
  prescriptionImageUrl?: string;
  rejectionReason?: string;
}

interface Student {
  studentId: number;
  name: string;
  class: string;
}

const statusLabelMap: Record<string, string> = {
  PendingConfirmation: "Chờ xác nhận",
  Approved: "Đã duyệt",
  Administered: "Đã cho uống",
  Rejected: "Bị từ chối"
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "PendingConfirmation": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Approved": return "bg-blue-100 text-blue-800 border-blue-200";
    case "Administered": return "bg-green-100 text-green-800 border-green-200";
    case "Rejected": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "PendingConfirmation": return <Clock size={16} className="text-yellow-600" />;
    case "Approved": return <CheckCircle size={16} className="text-blue-600" />;
    case "Administered": return <CheckCircle size={16} className="text-green-600" />;
    case "Rejected": return <XCircle size={16} className="text-red-600" />;
    default: return <AlertCircle size={16} className="text-gray-600" />;
  }
};

const Medications = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [editing, setEditing] = useState<Medication | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("/parent/health/students");
      setStudents(res.data);
    } catch {
      toast.error("Không thể tải danh sách học sinh.");
    }
  };

  const fetchMedications = async () => {
    try {
      const res = await axios.get("/parent/health/medications");
      setMedications(res.data);
      /* * SỬA LỖI HIỂN THỊ ẢNH:
       * Vấn đề nằm ở Backend. API "/parent/health/medications" của bạn
       * chưa trả về trường `prescriptionImageUrl`.
       * * HƯỚNG DẪN SỬA:
       * 1. Mở file `MedicationService.cs` (hoặc service tương ứng).
       * 2. Tìm đến phương thức `GetForParentAsync` (hoặc phương thức được gọi bởi API trên).
       * 3. Trong câu lệnh `.Select(m => new MedicationReadDTO { ... })`,
       * bạn cần đảm bảo đã ánh xạ trường ảnh như sau:
       * * .Select(m => new MedicationReadDTO 
       * {
       * // ... các trường khác
       * PrescriptionImageUrl = m.PrescriptionImageUrl // <-- THÊM DÒNG NÀY
       * })
       *
       * Sau khi sửa backend, frontend sẽ tự động hiển thị đúng.
      */
    } catch {
      toast.error("Không thể tải danh sách thuốc.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStudents(), fetchMedications()]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">💊 Quản lý thuốc học sinh</h2>
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Pill className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">💊 Quản lý thuốc học sinh</h2>
        <p className="text-gray-500">Chưa có học sinh nào được liên kết với phụ huynh này.</p>
      </div>
    );
  }

  const tabs = students.map((student) => {
    const studentMeds = medications.filter(m => m.studentId === student.studentId);
    return {
      key: student.studentId.toString(),
      label: (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {student.name.charAt(0)}
          </div>
          <div className="text-left">
            <div className="font-semibold">{student.name}</div>
            <div className="text-xs text-gray-500">{student.class}</div>
          </div>
        </div>
      ),
      content: (
        <div className="space-y-8">
          <MedicationForm
            studentId={student.studentId}
            editingData={editing?.studentId === student.studentId ? editing : null}
            onSaved={() => {
              fetchMedications();
              setEditing(null);
            }}
            clearEditing={() => setEditing(null)}
          />

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <Pill className="w-5 h-5 text-green-600" />
                <span>Danh sách thuốc đã gửi</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                  {studentMeds.length}
                </span>
              </h3>
            </div>

            <div className="p-6">
              {studentMeds.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Pill className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">Chưa gửi thuốc nào</p>
                  <p className="text-gray-400 text-sm mt-2">Hãy thêm thông tin thuốc cho học sinh</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left p-4 font-semibold text-gray-700">Tên thuốc</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Toa thuốc</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Thời gian</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Trạng thái</th>
                        <th className="text-center p-4 font-semibold text-gray-700">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentMeds.map((m) => (
                        <tr key={m.medicationId} className="border-b hover:bg-gray-50">
                          <td className="p-4">{m.medicationName}</td>
                          <td className="p-4">
                            {m.prescriptionImageUrl ? (
                              <a href={m.prescriptionImageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-blue-600 hover:underline">
                                <FileImage size={16} />
                                <span>Xem ảnh</span>
                              </a>
                            ) : (
                              <span className="text-gray-400 italic">Không có</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Calendar size={14} />
                              <span>
                                {new Date(m.startDate).toLocaleDateString()} → {new Date(m.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(m.status)} inline-flex`}>
                              {getStatusIcon(m.status)}
                              <span>{statusLabelMap[m.status] || m.status}</span>
                            </div>
                            {m.status === 'Rejected' && m.rejectionReason && (
                               <p className="text-xs text-red-600 mt-1 italic">Lý do: {m.rejectionReason}</p>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              <button
                                onClick={() => {
                                  if (m.status !== "PendingConfirmation") {
                                    toast.info("Chỉ có thể chỉnh sửa yêu cầu đang chờ xác nhận.");
                                    return;
                                  }
                                  setEditing(m);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  m.status !== "PendingConfirmation" 
                                    ? "text-gray-400 cursor-not-allowed" 
                                    : "text-blue-600 hover:bg-blue-50"
                                }`}
                                title={m.status !== "PendingConfirmation" ? "Không thể chỉnh sửa" : "Chỉnh sửa"}
                                disabled={m.status !== "PendingConfirmation"}
                              >
                                <Pencil size={18} />
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
      )
    };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">💊 Quản lý thuốc học sinh</h2>
        <p className="text-gray-600">Gửi yêu cầu cho nhà trường để học sinh uống thuốc</p>
      </div>
      <Tabs tabs={tabs} onChange={() => setEditing(null)} />
    </div>
  );
};

export default Medications;
