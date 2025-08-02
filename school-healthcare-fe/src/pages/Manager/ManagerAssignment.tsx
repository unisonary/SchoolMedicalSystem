import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { 
  Users, 
  ClipboardList, 
  CheckCircle2, 
  Calendar,
  User,
  Target,
  RefreshCw,
  AlertCircle,
  CheckSquare,
  Square
} from "lucide-react";

interface Student {
  studentId: number;
  name: string;
  class: string;
  parentId: number;
}

interface Nurse {
  nurseId: number;
  name: string;
}

interface Plan {
  planId: number;
  planName: string;
}

const ManagerAssignment = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedNurseId, setSelectedNurseId] = useState<number | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStudents = async () => {
    if (selectedPlanId) {
      try {
        setLoading(true);
        const res = await axios.get(`/manager/assignments/consented-students/${selectedPlanId}`);
        setStudents(res.data);
      } catch {
        toast.error("Không thể tải danh sách học sinh đã đồng ý");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadStudents();
  }, [selectedPlanId]);

  // Load danh sách kế hoạch và y tá
  useEffect(() => {
    axios.get("/manager/plans")
      .then((res) => setPlans(res.data))
      .catch(() => toast.error("Không thể tải danh sách kế hoạch"));

    axios.get("/nurses") // Đảm bảo backend có route này
      .then((res) => setNurses(res.data))
      .catch(() => toast.error("Không thể tải danh sách y tá"));
  }, []);

  // Khi chọn plan, load học sinh đã đồng ý
  useEffect(() => {
    if (selectedPlanId) {
      axios.get(`/manager/assignments/consented-students/${selectedPlanId}`)
        .then((res) => setStudents(res.data))
        .catch(() => toast.error("Không thể tải danh sách học sinh đã đồng ý"));
    }
  }, [selectedPlanId]);

  const toggleStudent = (id: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const selectAllStudents = () => {
    const allStudentIds = students.map(s => s.studentId);
    setSelectedStudentIds(allStudentIds);
    toast.success(`Đã chọn tất cả ${students.length} học sinh`);
  };

  const deselectAllStudents = () => {
    setSelectedStudentIds([]);
    toast.info("Đã bỏ chọn tất cả học sinh");
  };

  const isAllSelected = students.length > 0 && selectedStudentIds.length === students.length;

  const handleAssign = async () => {
    if (!selectedPlanId || !selectedNurseId || selectedStudentIds.length === 0) {
      console.log("Assigning:", {
        selectedPlanId,
        selectedNurseId,
        selectedStudentIds
      });      
      toast.warning("Vui lòng chọn kế hoạch, y tá và học sinh");
      return;
    }

    try {
      await axios.post("/manager/assignments", {
        planId: selectedPlanId,
        nurseId: selectedNurseId,
        studentIds: selectedStudentIds
      });
      toast.success("Phân công thành công!");
      setSelectedStudentIds([]);
      setSelectedNurseId(null);

      await loadStudents();
    } catch {
      toast.error("Lỗi khi phân công y tá");
    }
  };

  const selectedPlan = plans.find(p => p.planId === selectedPlanId);
  const selectedNurse = nurses.find(n => n.nurseId === selectedNurseId);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📌 Phân công y tá cho kế hoạch y tế</h2>
        <p className="text-gray-600">Quản lý và phân công y tá thực hiện các kế hoạch y tế cho học sinh</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Tổng kế hoạch</h3>
              <p className="text-2xl font-bold text-blue-600">{plans.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Y tá khả dụng</h3>
              <p className="text-2xl font-bold text-green-600">{nurses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-800">Học sinh đã chọn</h3>
              <p className="text-2xl font-bold text-purple-600">{selectedStudentIds.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Form */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span>Chọn kế hoạch và y tá</span>
          </h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <ClipboardList className="w-4 h-4 text-blue-500" />
                <span>Chọn kế hoạch</span>
              </label>
              <div className="relative">
                <select
                  value={selectedPlanId ?? ""}
                  onChange={(e) => setSelectedPlanId(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
                >
                  <option value="">-- Chọn kế hoạch --</option>
                  {plans.map((p) => (
                    <option key={p.planId} value={p.planId}>{p.planName}</option>
                  ))}
                </select>
                <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <User className="w-4 h-4 text-green-500" />
                <span>Chọn y tá</span>
              </label>
              <div className="relative">
                <select
                  value={selectedNurseId ?? ""}
                  onChange={(e) => setSelectedNurseId(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-white"
                >
                  <option value="">-- Chọn y tá --</option>
                  {nurses.map((n) => (
                    <option key={n.nurseId} value={n.nurseId}>{n.name}</option>
                  ))}
                </select>
                <Users className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Selected Info */}
          {(selectedPlan || selectedNurse) && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2">Thông tin đã chọn:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedPlan && (
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Kế hoạch: {selectedPlan.planName}
                    </span>
                  </div>
                )}
                {selectedNurse && (
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Y tá: {selectedNurse.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-500" />
              <span className="text-xl font-semibold text-gray-800">Danh sách học sinh đã đồng ý</span>
              {students.length > 0 && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                  {students.length}
                </span>
              )}
            </div>
            
            {/* Select All Controls */}
            {students.length > 0 && (
              <div className="flex items-center space-x-2">
                {isAllSelected ? (
                  <button
                    onClick={deselectAllStudents}
                    className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition-all text-sm font-medium"
                  >
                    <Square className="w-4 h-4" />
                    <span>Bỏ chọn tất cả</span>
                  </button>
                ) : (
                  <button
                    onClick={selectAllStudents}
                    className="flex items-center space-x-2 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg transition-all text-sm font-medium"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Chọn tất cả</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
              <p className="text-gray-500 text-lg">Đang tải dữ liệu...</p>
            </div>
          ) : students.length > 0 ? (
            <div>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Chọn học sinh cần phân công y tá (đã chọn: {selectedStudentIds.length}/{students.length})</span>
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {students.map((s) => (
                  <label 
                    key={s.studentId} 
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedStudentIds.includes(s.studentId)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(s.studentId)}
                      onChange={() => toggleStudent(s.studentId)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{s.name}</div>
                      <div className="text-sm text-gray-600 flex items-center space-x-1">
                        <Target className="w-3 h-3" />
                        <span>Lớp {s.class}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Không có học sinh nào đã đồng ý</p>
              <p className="text-gray-400 text-sm mt-2">
                {selectedPlanId 
                  ? "Chưa có học sinh nào đồng ý tham gia kế hoạch này hoặc đã được phân công"
                  : "Vui lòng chọn kế hoạch để xem danh sách học sinh"
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Button */}
      {students.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Sẵn sàng phân công?</h4>
                <p className="text-sm text-gray-600">
                  {selectedStudentIds.length > 0 && selectedNurseId && selectedPlanId
                    ? `Phân công ${selectedStudentIds.length} học sinh cho ${selectedNurse?.name}`
                    : "Vui lòng chọn đầy đủ thông tin để thực hiện phân công"
                  }
                </p>
              </div>
              <button
                onClick={handleAssign}
                disabled={!selectedPlanId || !selectedNurseId || selectedStudentIds.length === 0}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:cursor-not-allowed disabled:transform-none"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Phân công</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerAssignment;