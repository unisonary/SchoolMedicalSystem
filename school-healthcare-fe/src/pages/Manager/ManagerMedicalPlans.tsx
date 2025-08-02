import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { 
  Plus, 
  Edit3, 
  Save, 
  X, 
  ClipboardList, 
  RefreshCw, 
  Calendar,
  Users,
  Activity,
  CheckCircle2,
  Clock,
  FileText,
  Target,
  Stethoscope,
  Syringe,
  Loader2
} from "lucide-react";

interface MedicalPlan {
  planId: number;
  planType: string;
  planName: string;
  description: string;
  startDate: string;
  endDate: string;
  targetGrade: string;
  status: string;
  createdDate: string;
}

const emptyForm = {
  planType: "Vaccination",
  planName: "",
  description: "",
  startDate: "",
  endDate: "",
  targetGrade: "",
  status: "Planned",
};

const ManagerMedicalPlans = () => {
  const [plans, setPlans] = useState<MedicalPlan[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  
  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/manager/plans");
      setPlans(res.data);
    } catch {
      toast.error("Không thể tải danh sách kế hoạch.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setIsLoadingClasses(true);
      const res = await axios.get("/manager/plans/classes");
      setClasses(res.data);
    } catch {
      toast.error("Không thể tải danh sách lớp.");
    } finally {
      setIsLoadingClasses(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchClasses();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.warning("Ngày kết thúc không được trước ngày bắt đầu.");
      return;
    }

    try {
      setIsCreating(true);
      await axios.post("/manager/plans", form);
      toast.success("Đã tạo kế hoạch mới");
      setForm({ ...emptyForm });
      fetchPlans();
    } catch {
      toast.error("Lỗi khi tạo kế hoạch.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      setProcessingIds(prev => new Set(prev).add(id));
      await axios.put(`/manager/plans/${id}`, form);
      toast.success("Đã cập nhật kế hoạch.");
      setEditingId(null);
      fetchPlans();
    } catch {
      toast.error("Không thể cập nhật.");
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleEdit = (plan: MedicalPlan) => {
    setEditingId(plan.planId);
    setForm({ ...plan });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planned":
        return "text-blue-600 bg-blue-100";
      case "In_Progress":
        return "text-orange-600 bg-orange-100";
      case "Completed":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Planned":
        return "Đã lên kế hoạch";
      case "In_Progress":
        return "Đang thực hiện";
      case "Completed":
        return "Đã hoàn thành";
      default:
        return status;
    }
  };

  const getPlanTypeIcon = (planType: string) => {
    return planType === "Vaccination" ? (
      <Syringe className="w-4 h-4 text-purple-500" />
    ) : (
      <Stethoscope className="w-4 h-4 text-green-500" />
    );
  };

  const isFormDisabled = isCreating || loading;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📋 Quản lý kế hoạch y tế</h2>
        <p className="text-gray-600">Tạo và quản lý các kế hoạch tiêm chủng, khám sức khỏe cho học sinh</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-800">Đang thực hiện</h3>
              <p className="text-2xl font-bold text-orange-600">
                {plans.filter(p => p.status === "In_Progress").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Đã hoàn thành</h3>
              <p className="text-2xl font-bold text-green-600">
                {plans.filter(p => p.status === "Completed").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-800">Đã lên kế hoạch</h3>
              <p className="text-2xl font-bold text-purple-600">
                {plans.filter(p => p.status === "Planned").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Plan */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Plus className="w-5 h-5 text-green-500" />
            <span>Tạo kế hoạch mới</span>
            {isCreating && (
              <Loader2 className="w-4 h-4 animate-spin text-green-500" />
            )}
          </h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Loại kế hoạch</label>
              <div className="relative">
                <select 
                  name="planType" 
                  value={form.planType} 
                  onChange={handleInput} 
                  disabled={isFormDisabled}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="Vaccination">💉 Tiêm chủng</option>
                  <option value="Health_Checkup">🩺 Khám sức khỏe</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tên kế hoạch</label>
              <input 
                name="planName" 
                value={form.planName} 
                onChange={handleInput} 
                placeholder="Nhập tên kế hoạch..." 
                disabled={isFormDisabled}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ngày bắt đầu</label>
              <div className="relative">
                <input 
                  type="date" 
                  name="startDate" 
                  value={form.startDate} 
                  onChange={handleInput} 
                  disabled={isFormDisabled}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                  min={tomorrow} 
                />
                <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ngày kết thúc</label>
              <div className="relative">
                <input 
                  type="date" 
                  name="endDate" 
                  value={form.endDate} 
                  onChange={handleInput} 
                  disabled={isFormDisabled}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                  min={form.startDate || tomorrow} 
                />
                <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <span>Lớp học</span>
                {isLoadingClasses && (
                  <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
                )}
              </label>
              <div className="relative">
                <select 
                  name="targetGrade" 
                  value={form.targetGrade} 
                  onChange={handleInput} 
                  disabled={isFormDisabled || isLoadingClasses}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {isLoadingClasses ? "-- Đang tải..." : "-- Chọn lớp --"}
                  </option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
                <Target className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Mô tả kế hoạch</label>
              <div className="relative">
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleInput} 
                  placeholder="Nhập mô tả chi tiết về kế hoạch..." 
                  disabled={isFormDisabled}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed" 
                  rows={3}
                />
                <FileText className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <button 
            onClick={handleCreate} 
            disabled={isFormDisabled}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isCreating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            <span>{isCreating ? "Đang tạo..." : "Tạo kế hoạch"}</span>
          </button>
        </div>
      </div>

      {/* Plans List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <ClipboardList className="w-5 h-5 text-blue-500" />
              <span>Danh sách kế hoạch</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                {plans.length}
              </span>
              {loading && (
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              )}
            </h3>
            <button 
              onClick={fetchPlans} 
              disabled={loading || isCreating}
              className="flex items-center space-x-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Đang tải..." : "Làm mới"}</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
              <p className="text-gray-500 text-lg">Đang tải dữ liệu...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Chưa có kế hoạch nào</p>
              <p className="text-gray-400 text-sm mt-2">Tạo kế hoạch mới để bắt đầu quản lý</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-700">STT</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Tên kế hoạch</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Loại</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Thời gian</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Lớp</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Trạng thái</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan, index) => (
                    <tr key={plan.planId} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <td className="p-4 font-medium text-gray-600">{index + 1}</td>
                      <td className="p-4">
                        {editingId === plan.planId ? (
                          <input 
                            name="planName" 
                            value={form.planName} 
                            onChange={handleInput} 
                            disabled={processingIds.has(plan.planId)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-800">{plan.planName}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {getPlanTypeIcon(plan.planType)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            plan.planType === "Vaccination" 
                              ? "bg-purple-100 text-purple-800" 
                              : "bg-green-100 text-green-800"
                          }`}>
                            {plan.planType === "Vaccination" ? "Tiêm chủng" : "Khám sức khỏe"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(plan.startDate).toLocaleDateString("vi-VN")} - {new Date(plan.endDate).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                            {plan.targetGrade}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {editingId === plan.planId ? (
                          <select 
                            name="status" 
                            value={form.status} 
                            onChange={handleInput} 
                            disabled={processingIds.has(plan.planId)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="Planned">Đã lên kế hoạch</option>
                            <option value="In_Progress">Đang thực hiện</option>
                            <option value="Completed">Đã hoàn thành</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.status)}`}>
                            {getStatusText(plan.status)}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center space-x-2">
                          {editingId === plan.planId ? (
                            <>
                              <button 
                                onClick={() => handleUpdate(plan.planId)} 
                                disabled={processingIds.has(plan.planId)}
                                className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-3 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                              >
                                {processingIds.has(plan.planId) ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                              </button>
                              <button 
                                onClick={cancelEdit} 
                                disabled={processingIds.has(plan.planId)}
                                className="flex items-center space-x-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium px-3 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => handleEdit(plan)} 
                              disabled={isCreating || processingIds.size > 0}
                              className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-3 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
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
  );
};

export default ManagerMedicalPlans;