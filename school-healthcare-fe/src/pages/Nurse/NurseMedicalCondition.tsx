import { useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { Search, User, AlertCircle, Heart, FileText, Calendar, Phone } from "lucide-react";

// Interface cho kết quả tìm kiếm học sinh
interface StudentSearchResult {
  studentId: number;
  name: string;
  parentName: string;
  parentPhone: string;
  className: string;
}

// Interface cho thông tin bệnh lý
interface MedicalCondition {
  conditionId: number;
  conditionType: string;
  conditionName: string;
  severity: string;
  description: string;
  studentId: number;
  studentName: string;
}

const NurseMedicalCondition = () => {
  const [studentName, setStudentName] = useState<string>("");
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);
  const [medicalConditions, setMedicalConditions] = useState<MedicalCondition[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Tìm kiếm học sinh theo tên
  const handleStudentSearch = async (keyword: string) => {
    setStudentName(keyword);
    
    if (keyword.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setSearching(true);
    try {
      const res = await axios.get(`/student/search?name=${encodeURIComponent(keyword)}`);
      setSearchResults(res.data);
      setShowDropdown(true);
    } catch (error) {
      toast.error("Lỗi khi tìm kiếm học sinh.");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Chọn học sinh và lấy thông tin bệnh lý
  const handleSelectStudent = async (student: StudentSearchResult) => {
    setSelectedStudent(student);
    setStudentName(student.name);
    setShowDropdown(false);
    setMedicalConditions([]);
    
    setLoading(true);
    try {
      const res = await axios.get(`/nurse/medical-condition/${student.studentId}`);
      setMedicalConditions(res.data);
      
      if (res.data.length === 0) {
        toast.info(`Học sinh ${student.name} không có bệnh lý nào được ghi nhận.`);
      } else {
        toast.success(`Tìm thấy ${res.data.length} bệnh lý của học sinh ${student.name}.`);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải thông tin bệnh lý.");
    } finally {
      setLoading(false);
    }
  };

  // Lấy màu sắc theo mức độ nghiêm trọng
  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "nhẹ":
        return "bg-green-100 text-green-800 border-green-200";
      case "trung bình":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "nặng":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "nguy kịch":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Lấy icon theo loại bệnh lý
  const getConditionTypeIcon = (conditionType: string) => {
    switch (conditionType) {
      case "Dị ứng":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "Bệnh tim":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "Bệnh mãn tính":
        return <Calendar className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  // Reset form
  const handleReset = () => {
    setStudentName("");
    setSelectedStudent(null);
    setMedicalConditions([]);
    setSearchResults([]);
    setShowDropdown(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🩺 Tra cứu bệnh lý học sinh</h2>
        <p className="text-gray-600">Tìm kiếm và xem thông tin bệnh lý của học sinh</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Search className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-800">Tìm kiếm học sinh</h3>
        </div>

        <div className="relative">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Nhập tên học sinh để tìm kiếm..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                value={studentName}
                onChange={(e) => handleStudentSearch(e.target.value)}
              />
              
              {searching && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}

              {/* Dropdown kết quả tìm kiếm */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 w-full max-h-60 overflow-auto">
                  {searchResults.map((student) => (
                    <div
                      key={student.studentId}
                      onClick={() => handleSelectStudent(student)}
                      className="p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{student.name}</div>
                          <div className="text-sm text-gray-500">
                            Lớp: {student.className} • PH: {student.parentName}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{student.parentPhone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Selected Student Info */}
      {selectedStudent && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {selectedStudent.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{selectedStudent.name}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Lớp: <span className="font-medium">{selectedStudent.className}</span></div>
                <div>Phụ huynh: <span className="font-medium">{selectedStudent.parentName}</span></div>
                <div className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>{selectedStudent.parentPhone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical Conditions */}
      {selectedStudent && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-500" />
              <h3 className="text-xl font-semibold text-gray-800">Thông tin bệnh lý</h3>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {medicalConditions.length} bệnh lý
              </span>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Đang tải thông tin bệnh lý...</p>
              </div>
            ) : medicalConditions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-gray-500 text-lg">Không có bệnh lý nào được ghi nhận</p>
                <p className="text-gray-400 text-sm mt-2">
                  Học sinh {selectedStudent.name} hiện tại không có bệnh lý nào trong hệ thống
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {medicalConditions.map((condition) => (
                  <div
                    key={condition.conditionId}
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-3 mb-4">
                      {getConditionTypeIcon(condition.conditionType)}
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">
                          {condition.conditionName}
                        </h4>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {condition.conditionType}
                          </span>
                          <span className={`text-sm px-2 py-1 rounded border ${getSeverityColor(condition.severity)}`}>
                            {condition.severity}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                          Mô tả chi tiết:
                        </label>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {condition.description || "Không có mô tả chi tiết"}
                        </p>
                      </div>

                      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                        <span className="font-medium">Mã bệnh lý:</span> #{condition.conditionId}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedStudent && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <User className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h4 className="text-lg font-semibold text-blue-800 mb-2">Hướng dẫn sử dụng</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Nhập tên học sinh vào ô tìm kiếm (tối thiểu 2 ký tự)</li>
                <li>• Chọn học sinh từ danh sách kết quả</li>
                <li>• Hệ thống sẽ tự động hiển thị thông tin bệnh lý của học sinh</li>
                <li>• Sử dụng nút "Làm mới" để tìm kiếm học sinh khác</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseMedicalCondition;