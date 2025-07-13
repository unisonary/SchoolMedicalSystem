import { useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { Search, KeyRound } from "lucide-react";

const AdminPassword = () => {
  const [username, setUsername] = useState("");
  const [userResult, setUserResult] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          className="w-full border rounded-lg px-4 py-2 text-sm"
          placeholder="Nhập username để tìm kiếm"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
        >
          <Search size={16} />
        </button>
      </div>

      {userResult && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
          <div>
            <strong>Username:</strong> {userResult.username}
          </div>
          <div>
            <strong>Role:</strong> {userResult.role}
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm">Mật khẩu mới:</label>
            <input
              type="password"
              className="border rounded px-4 py-2 text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              onClick={handleResetPassword}
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 mt-2"
              disabled={loading}
            >
              <KeyRound size={16} />
              Đổi mật khẩu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPassword;
