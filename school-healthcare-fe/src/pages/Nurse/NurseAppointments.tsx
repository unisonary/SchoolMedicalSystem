import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import {  Plus, Calendar, Clock,  UserCheck, CheckCircle, XCircle, AlertCircle, RefreshCw, Edit3, Filter, Users, CalendarDays, } from "lucide-react";

interface Appointment {
  appointmentId: number;
  studentName: string;
  parentName: string;
  status: string;
  notes: string;
  appointmentDate: string;
}

const NurseAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "",
    notes: "",
    appointmentDate: "",
  });
  const [newForm, setNewForm] = useState({
    studentId: 0,
    parentId: 0,
    appointmentDate: "",
    notes: "",
  });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const url =
        filterStatus === "All"
          ? "/nurse/appointments"
          : `/nurse/appointments?status=${filterStatus}`;
      const res = await axios.get(url);
  
      const priority = {
        Pending: 1,
        Cancelled: 2,
        Completed: 3,
      } as const;
      
      const sorted = [...res.data].sort((a, b) => {
        return priority[a.status as keyof typeof priority] - priority[b.status as keyof typeof priority];
      });
      
  
      setAppointments(sorted);
    } catch {
      toast.error("Không thể tải danh sách lịch hẹn.");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus]);

  const handleUpdate = async (id: number) => {
    try {
      await axios.put(`/nurse/appointments/${id}`, editForm);
      toast.success("✅ Đã cập nhật lịch hẹn.");
      setEditingId(null);
      fetchAppointments();
    } catch {
      toast.error("❌ Lỗi khi cập nhật.");
    }
  };

  const handleCreate = async () => {
    if (!newForm.studentId || !newForm.parentId || !newForm.appointmentDate) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    try {
      await axios.post("/nurse/appointments", newForm);
      toast.success("Đã tạo lịch tư vấn mới.");
      setNewForm({
        studentId: 0,
        parentId: 0,
        appointmentDate: "",
        notes: "",
      });
      fetchAppointments();
    } catch {
      toast.error("Không thể tạo lịch hẹn.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      status: "",
      notes: "",
      appointmentDate: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4" />;
      case "Completed":
        return <CheckCircle className="w-4 h-4" />;
      case "Cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Pending":
        return "Chờ xử lý";
      case "Completed":
        return "Đã tư vấn";
      case "Cancelled":
        return "Đã huỷ";
      default:
        return status;
    }
  };

  // Calculate stats
  const pendingCount = appointments.filter(apt => apt.status === "Pending").length;
  const completedCount = appointments.filter(apt => apt.status === "Completed").length;
  const cancelledCount = appointments.filter(apt => apt.status === "Cancelled").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📅 Quản lý lịch hẹn tư vấn</h2>
        <p className="text-gray-600">Theo dõi và quản lý lịch hẹn tư vấn sức khỏe với phụ huynh</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Tổng lịch hẹn</h3>
              <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Chờ xử lý</h3>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Đã tư vấn</h3>
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Đã huỷ</h3>
              <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Refresh */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <label className="font-medium text-gray-700">Lọc theo trạng thái:</label>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="All">Tất cả</option>
            <option value="Pending">Chờ xử lý</option>
            <option value="Completed">Đã tư vấn</option>
            <option value="Cancelled">Đã huỷ</option>
          </select>
        </div>

        <button
          onClick={fetchAppointments}
          disabled={loading}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? "Đang tải..." : "Làm mới"}</span>
        </button>
      </div>

      {/* Create New Appointment Form */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Plus className="w-5 h-5 text-green-500" />
            <span>Tạo lịch tư vấn mới</span>
          </h3>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mã học sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Nhập mã học sinh"
                value={newForm.studentId || ""}
                onChange={(e) => setNewForm({ ...newForm, studentId: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mã phụ huynh <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Nhập mã phụ huynh"
                value={newForm.parentId || ""}
                onChange={(e) => setNewForm({ ...newForm, parentId: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Thời gian hẹn <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={newForm.appointmentDate}
                onChange={(e) => setNewForm({ ...newForm, appointmentDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú</label>
              <input
                type="text"
                placeholder="Nhập ghi chú (không bắt buộc)"
                value={newForm.notes}
                onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={handleCreate}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Tạo lịch hẹn</span>
            </button>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span>Danh sách lịch hẹn tư vấn</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {appointments.length}
            </span>
          </h3>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
              <p className="text-gray-500 text-lg">Đang tải dữ liệu...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Chưa có lịch hẹn nào</p>
              <p className="text-gray-400 text-sm mt-2">Hãy tạo lịch hẹn mới để bắt đầu quản lý</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-700">STT</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Học sinh</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Phụ huynh</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Thời gian</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Trạng thái</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Ghi chú</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt, index) => (
                    <tr key={apt.appointmentId} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <td className="p-4 font-medium text-gray-600">{index + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {apt.studentName.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800">{apt.studentName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{apt.parentName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {new Date(apt.appointmentDate).toLocaleDateString("vi-VN", {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {editingId === apt.appointmentId ? (
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          >
                            <option value="Pending">Chờ xử lý</option>
                            <option value="Completed">Đã tư vấn</option>
                            <option value="Cancelled">Đã huỷ</option>
                          </select>
                        ) : (
                          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(apt.status)}`}>
                            {getStatusIcon(apt.status)}
                            <span>{getStatusText(apt.status)}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {editingId === apt.appointmentId ? (
                          <input
                            value={editForm.notes}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Nhập ghi chú"
                          />
                        ) : (
                          <span className="text-gray-600 text-sm">{apt.notes || "Không có ghi chú"}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center space-x-2">
                          {editingId === apt.appointmentId ? (
                            <>
                              <button
                                onClick={() => handleUpdate(apt.appointmentId)}
                                className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-3 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Lưu</span>
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="flex items-center space-x-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium px-3 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Huỷ</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingId(apt.appointmentId);
                                setEditForm({
                                  status: apt.status,
                                  notes: apt.notes,
                                  appointmentDate: apt.appointmentDate,
                                });
                              }}
                              className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-3 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>Sửa</span>
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

export default NurseAppointments;