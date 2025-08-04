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
  AlertCircle,
  CheckSquare,
  Square,
  XCircle,
  Eye
} from "lucide-react";

interface Student {
  studentId: number;
  name: string;
  class: string;
  parentId: number;
  notes?: string; // Ghi chú từ chối (cho học sinh đã từ chối)
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
  const [rejectedStudents, setRejectedStudents] = useState<Student[]>([]);
  const [selectedNurseId, setSelectedNurseId] = useState<number | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'consented' | 'rejected'>('consented');

  const loadStudents = async () => {
    if (selectedPlanId) {
      try {
        setLoading(true);
        
        // Load học sinh đã đồng ý
        const consentedRes = await axios.get(`/manager/assignments/consented-students/${selectedPlanId}`);
        setStudents(consentedRes.data || []);
        
        // Load học sinh đã từ chối  
        try {
          const rejectedRes = await axios.get(`/manager/assignments/consents/denied?planId=${selectedPlanId}`);
          setRejectedStudents(rejectedRes.data || []);
        } catch (rejectedError) {
          setRejectedStudents([]);
          if ((rejectedError as any).response && (rejectedError as any).response.status !== 404) {
            toast.error("Có lỗi khi tải danh sách học sinh đã từ chối");
          }
        }
        
      } catch (error) {
        toast.error("Không thể tải danh sách học sinh đã đồng ý");
        setStudents([]);
        setRejectedStudents([]);
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
    // Load Plans
    axios.get("/manager/plans") 
      .then((res) => setPlans(res.data || []))
      .catch(() => toast.error("Không thể tải danh sách kế hoạch"));

    // Load Nurses
    axios.get("/nurses")
      .then((res) => setNurses(res.data || []))
      .catch(() => toast.error("Không thể tải danh sách y tá"));
  }, []);

  // Reset selectedStudentIds khi chuyển đổi view mode
  useEffect(() => {
    setSelectedStudentIds([]);
  }, [viewMode]);

  const toggleStudent = (id: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const currentStudents = viewMode === 'consented' ? students : rejectedStudents;

  const selectAllStudents = () => {
    const allStudentIds = currentStudents.map(s => s.studentId);
    setSelectedStudentIds(allStudentIds);
    toast.success(`Đã chọn tất cả ${currentStudents.length} học sinh`);
  };

  const deselectAllStudents = () => {
    setSelectedStudentIds([]);
    toast.info("Đã bỏ chọn tất cả học sinh");
  };

  const isAllSelected = currentStudents.length > 0 && selectedStudentIds.length === currentStudents.length;

  const handleAssign = async () => {
    if (!selectedPlanId || !selectedNurseId || selectedStudentIds.length === 0) {
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
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
          <ClipboardList className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
          Phân công y tá cho kế hoạch y tế
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Quản lý và phân công y tá thực hiện các kế hoạch y tế cho học sinh một cách hiệu quả
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6 rounded-2xl border border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-800 mb-1">Tổng kế hoạch</h3>
              <p className="text-3xl font-bold text-blue-600 tabular-nums">{plans.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 via-green-100 to-green-200 p-6 rounded-2xl border border-green-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-800 mb-1">Y tá khả dụng</h3>
              <p className="text-3xl font-bold text-green-600 tabular-nums">{nurses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 p-6 rounded-2xl border border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-purple-800 mb-1">Học sinh đã chọn</h3>
              <p className="text-3xl font-bold text-purple-600 tabular-nums">{selectedStudentIds.length}</p>
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
        {/* View Mode Tabs */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
          <div className="flex space-x-2 bg-white rounded-xl p-1.5 shadow-lg border border-gray-200">
            <button
              onClick={() => setViewMode('consented')}
              className={`flex items-center space-x-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-300 transform ${
                viewMode === 'consented'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50 hover:scale-105'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Đã đồng ý</span>
              {students.length > 0 && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  viewMode === 'consented' 
                    ? 'bg-green-400 text-green-900' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {students.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setViewMode('rejected')}
              className={`flex items-center space-x-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-300 transform ${
                viewMode === 'rejected'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50 hover:scale-105'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Đã từ chối</span>
              {rejectedStudents.length > 0 && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  viewMode === 'rejected' 
                    ? 'bg-red-400 text-red-900' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {rejectedStudents.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className={`${
          viewMode === 'consented' 
            ? 'bg-gradient-to-r from-green-50 to-green-100' 
            : 'bg-gradient-to-r from-red-50 to-red-100'
        } px-6 py-4 border-b`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {viewMode === 'consented' ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-xl font-semibold text-gray-800">
                {viewMode === 'consented' ? 'Danh sách học sinh đã đồng ý' : 'Danh sách học sinh đã từ chối'}
              </span>
              {currentStudents.length > 0 && (
                <span className={`px-2 py-1 rounded-full text-sm ${
                  viewMode === 'consented' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentStudents.length}
                </span>
              )}
            </div>
            
            {/* Select All Controls - Chỉ hiển thị khi đang xem học sinh đã đồng ý */}
            {viewMode === 'consented' && currentStudents.length > 0 && (
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

            {/* Info cho học sinh đã từ chối */}
            {viewMode === 'rejected' && (
              <div className="flex items-center space-x-2 text-red-600">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">Chỉ xem, không thể phân công</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {/* Loading skeleton */}
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className={`grid gap-3 ${
                  viewMode === 'consented' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1 sm:grid-cols-2'
                }`}>
                  {[...Array(6)].map((_, index) => (
                    <div key={`skeleton-${index}`} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="animate-pulse space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-gray-200 rounded"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                          </div>
                        </div>
                        {viewMode === 'rejected' && (
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                            <div className="h-8 bg-gray-200 rounded"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : currentStudents.length > 0 ? (
            <div>
              {/* Chỉ hiển thị info box khi đang xem học sinh đã đồng ý */}
              {viewMode === 'consented' && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                    <span>Chọn học sinh cần phân công y tá (đã chọn: {selectedStudentIds.length}/{currentStudents.length})</span>
                  </p>
                </div>
              )}

              {/* Info box cho học sinh đã từ chối */}
              {viewMode === 'rejected' && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 flex items-center space-x-2">
                    <XCircle className="w-4 h-4" />
                    <span>Danh sách học sinh đã từ chối tham gia khám sức khỏe - chỉ để xem</span>
                </p>
              </div>
              )}
              
              <div className={`grid gap-3 ${
                viewMode === 'consented' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}>
                {currentStudents.map((s, index) => (
                  <div 
                    key={`${viewMode}-student-${s.studentId}-${index}`} 
                    className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                      viewMode === 'consented' 
                        ? selectedStudentIds.includes(s.studentId)
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 cursor-pointer shadow-md'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                        : viewMode === 'rejected'
                          ? 'border-red-200 bg-gradient-to-br from-red-50 to-red-100 shadow-sm'
                          : 'border-gray-200 bg-white'
                    }`}
                  >
                    {viewMode === 'consented' ? (
                      // Layout cho học sinh đã đồng ý (horizontal)
                      <div className="flex items-center space-x-3">
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
                      </div>
                    ) : (
                      // Layout cho học sinh đã từ chối (vertical với thông tin chi tiết)
                      <div className="space-y-3">
                        {/* Header với tên và lớp */}
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                            <XCircle className="w-5 h-5 text-red-500" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-800 text-lg">{s.name}</div>
                            <div className="text-sm text-gray-600 flex items-center space-x-1 mt-1">
                              <Target className="w-3 h-3" />
                              <span>Lớp {s.class}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="text-sm text-red-600 flex items-center space-x-2 bg-red-100 px-3 py-2 rounded-md">
                          <XCircle className="w-4 h-4" />
                          <span className="font-medium">Đã từ chối tham gia khám sức khỏe</span>
                        </div>

                        {/* Ghi chú từ chối */}
                        {s.notes && (
                          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                            <div className="font-medium text-gray-800 text-sm mb-2 flex items-center space-x-2">
                              <Eye className="w-4 h-4 text-gray-600" />
                              <span>Lý do từ chối:</span>
                            </div>
                            <div className="text-sm text-gray-700 italic leading-relaxed">
                              "{s.notes}"
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                viewMode === 'consented' 
                  ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200' 
                  : 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200'
              } animate-pulse`}>
                {viewMode === 'consented' ? (
                  <AlertCircle className="w-10 h-10 text-blue-400" />
                ) : (
                  <XCircle className="w-10 h-10 text-red-400" />
                )}
              </div>
              
              <div className="space-y-2 mb-6">
                <h3 className="text-xl font-semibold text-gray-700">
                  {viewMode === 'consented' 
                    ? 'Chưa có học sinh đồng ý' 
                    : 'Chưa có học sinh từ chối'
                  }
                </h3>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                  {selectedPlanId 
                    ? viewMode === 'consented'
                      ? "Chưa có học sinh nào đồng ý tham gia kế hoạch này hoặc đã được phân công y tá."
                      : "Tất cả phụ huynh đều đã đồng ý cho con em tham gia kế hoạch này."
                    : "Hãy chọn một kế hoạch y tế để xem danh sách học sinh."
                  }
                </p>
              </div>

              {!selectedPlanId && (
                <div className="inline-flex items-center space-x-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">Chọn kế hoạch để bắt đầu</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assignment Button - Chỉ hiển thị khi đang xem học sinh đã đồng ý */}
      {viewMode === 'consented' && students.length > 0 && (
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