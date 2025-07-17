import { useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { Search, KeyRound, User, Shield, UserCheck, Lock } from "lucide-react";

const AdminPassword = () => {
  const [username, setUsername] = useState("");
  const [userResult, setUserResult] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [loading] = useState(false);

  const handleSearch = async () => {
    if (!username.trim()) return toast.warn("Vui lòng nhập username");

    try {
      const res = await axios.get(`/admin/search?query=${username.trim()}`);
      const foundUser = res.data?.[0];
      if (foundUser) {
        setUserResult(foundUser);
        toast.success("Đã tìm thấy người dùng");
      } else {
        setUserResult(null);
        toast.error("Không tìm thấy người dùng phù hợp");
      }
    } catch (err) {
      toast.error("Lỗi khi tìm kiếm");
    }
  };

  const handleResetPassword = async () => {
    if (!userResult?.userId) return toast.error("Chưa có người dùng hợp lệ");
    if (!newPassword.trim()) return toast.warn("Vui lòng nhập mật khẩu mới");

    try {
      await axios.put("/admin/reset-password", {
        userId: userResult.userId,
        newPassword: newPassword.trim(),
      });

      toast.success("Đổi mật khẩu thành công!");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data || "Đổi mật khẩu thất bại");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 border-red-200";
      case "MANAGER":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "USER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="w-4 h-4 text-red-500" />;
      case "MANAGER":
        return <UserCheck className="w-4 h-4 text-purple-500" />;
      case "USER":
        return <User className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <KeyRound className="w-8 h-8 text-red-600" />
          </div>
         Quản lý mật khẩu người dùng
        </h2>
        <p className="text-gray-600">Tìm kiếm và thay đổi mật khẩu cho người dùng trong hệ thống</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
          <h3 className="text-xl font-semibold text-blue-800 flex items-center space-x-2">
            <Search className="w-5 h-5 text-blue-600" />
            <span>Tìm kiếm người dùng</span>
          </h3>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Nhập username để tìm kiếm..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md transition-all transform hover:scale-105 font-medium"
            >
              <Search className="w-4 h-4" />
              <span>Tìm kiếm</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Result Section */}
      {userResult && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
            <h3 className="text-xl font-semibold text-green-800 flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <span>👤 Thông tin người dùng</span>
            </h3>
          </div>

          <div className="p-6">
            <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Username</p>
                    <p className="text-lg font-semibold text-gray-800">{userResult.username}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    {getRoleIcon(userResult.role)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(userResult.role)}`}>
                      {getRoleIcon(userResult.role)}
                      <span>{userResult.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Reset Section */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Lock className="w-5 h-5 text-red-600" />
                <h4 className="text-lg font-semibold text-red-800">🔒 Đổi mật khẩu</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                      placeholder="Nhập mật khẩu mới..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={handleResetPassword}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-md transition-all transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loading}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Đổi mật khẩu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No User Found State */}
      {username && !userResult && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Không tìm thấy người dùng</p>
              <p className="text-gray-400 text-sm mt-2">Vui lòng kiểm tra lại username và thử lại</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPassword;