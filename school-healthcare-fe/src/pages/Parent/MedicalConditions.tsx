// MedicalConditions.tsx - Cải thiện giao diện
import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { Pencil, Trash, Plus, Heart } from "lucide-react";
import MedicalConditionForm from "./MedicalConditionForm";
import Tabs from "@/components/ui/Tabs";

interface MedicalCondition {
  conditionId: number;
  conditionType: string;
  conditionName: string;
  severity: string;
  description: string;
  studentId: number;
  studentName: string;
}

interface Student {
  studentId: number;
  name: string;
  class: string;
  dateOfBirth: string;
}

const MedicalConditions = () => {
  const [conditions, setConditions] = useState<MedicalCondition[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [, setSelectedStudentId] = useState<number | null>(null);
  const [editing, setEditing] = useState<MedicalCondition | null>(null);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xoá?")) return;
    try {
      await axios.delete(`/parent/health/medical-condition/${id}`);
      toast.success("Đã xoá thành công.");
      fetchConditions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể xoá.");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get("/parent/health/students");
      setStudents(res.data);
      if (res.data.length > 0) setSelectedStudentId(res.data[0].studentId);
    } catch {
      toast.error("Không thể tải danh sách học sinh.");
    }
  };

  const fetchConditions = async () => {
    try {
      const res = await axios.get("/parent/health/medical-condition");
      setConditions(res.data);
    } catch {
      toast.error("Không thể tải danh sách tình trạng y tế.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchStudents(), fetchConditions()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Nhẹ": return "bg-green-100 text-green-800 border-green-200";
      case "Trung bình": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Nặng": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">📋 Quản lý tình trạng y tế học sinh</h2>
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">📋 Quản lý tình trạng y tế học sinh</h2>
        <p className="text-gray-500">Chưa có học sinh nào được liên kết với phụ huynh này.</p>
      </div>
    );
  }

  const tabs = students.map((student) => {
    const studentConditions = conditions.filter((c) => c.studentId === student.studentId);
    return {
      key: student.studentId.toString(),
      label: (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {student.name.charAt(0)}
          </div>
          <div className="text-left">
            <div className="font-semibold">{student.name}</div>
            <div className="text-xs text-gray-500">{student.class}</div>
          </div>
        </div>
      ),
      content: (
        <div className="p-6 space-y-8">
          {/* Form Section */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border-2 border-blue-100">
            <div className="flex items-center space-x-3 mb-4">
              <Plus className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800">
                {editing ? "Chỉnh sửa tình trạng y tế" : "Thêm tình trạng y tế mới"}
              </h3>
            </div>
            <MedicalConditionForm
              studentId={student.studentId}
              editingData={editing?.studentId === student.studentId ? editing : null}
              onSaved={() => {
                fetchConditions();
                setEditing(null);
              }}
              clearEditing={() => setEditing(null)}
            />
          </div>

          {/* List Section */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span>Danh sách tình trạng y tế</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  {studentConditions.length}
                </span>
              </h3>
            </div>

            <div className="p-6">
              {studentConditions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">Chưa có dữ liệu tình trạng y tế</p>
                  <p className="text-gray-400 text-sm mt-2">Hãy thêm thông tin y tế cho học sinh</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left p-4 font-semibold text-gray-700">Loại tình trạng</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Tên bệnh</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Mức độ</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Ghi chú</th>
                        <th className="text-center p-4 font-semibold text-gray-700">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentConditions.map((c, index) => (
                        <tr key={c.conditionId} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                          <td className="p-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {c.conditionType}
                            </span>
                          </td>
                          <td className="p-4 font-medium text-gray-800">{c.conditionName}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(c.severity)}`}>
                              {c.severity}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600 max-w-xs truncate">{c.description || "Không có"}</td>
                          <td className="p-4">
                            <div className="flex justify-center space-x-2">
                              <button 
                                onClick={() => setEditing(c)} 
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Pencil size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(c.conditionId)} 
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa"
                              >
                                <Trash size={18} />
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
      ),
    };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📋 Quản lý tình trạng y tế học sinh</h2>
        <p className="text-gray-600">Theo dõi và quản lý thông tin sức khỏe của con em</p>
      </div>
      <Tabs tabs={tabs} onChange={(key) => {
        setEditing(null);
        setSelectedStudentId(parseInt(key));
      }} />
    </div>
  );
};

export default MedicalConditions;