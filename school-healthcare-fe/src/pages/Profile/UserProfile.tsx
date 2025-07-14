import { useEffect, useState } from "react";
import { User, Mail, Phone, Calendar, MapPin, Shield, Edit, Save, X, Camera } from "lucide-react";
import { getUserProfile } from "@/api/userApi";
import { useAuthStore } from "@/auth/useAuthStore";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";

const UserProfile = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    getUserProfile()
      .then((data) => {
        setProfileData(data);
        setEditData(data.profile || {});
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi tải hồ sơ:", err);
        setLoading(false);
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          navigate("/login");
        }
      });
  }, [user, navigate, logout]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profileData.profile || {});
  };

  const handleSave = () => {
    // TODO: Implement API call to update profile
    setProfileData({ ...profileData, profile: editData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(profileData.profile || {});
    setIsEditing(false);
  };

  const handleInputChange = (key: string, value: string) => {
    setEditData({ ...editData, [key]: value });
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'from-red-500 to-pink-500';
      case 'doctor': return 'from-blue-500 to-cyan-500';
      case 'nurse': return 'from-green-500 to-emerald-500';
      case 'teacher': return 'from-purple-500 to-violet-500';
      case 'parent': return 'from-orange-500 to-yellow-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return Shield;
      case 'doctor': case 'nurse': return User;
      default: return User;
    }
  };

  const formatFieldName = (key: string) => {
    const fieldNames: { [key: string]: string } = {
      'full_name': 'Họ và tên',
      'email': 'Email',
      'phone': 'Số điện thoại',
      'address': 'Địa chỉ',
      'date_of_birth': 'Ngày sinh',
      'gender': 'Giới tính',
      'emergency_contact': 'Liên hệ khẩn cấp',
      'medical_license': 'Giấy phép hành nghề',
      'specialization': 'Chuyên khoa',
      'experience_years': 'Số năm kinh nghiệm',
      'department': 'Phòng ban',
      'position': 'Chức vụ',
      'created_at': 'Ngày tạo tài khoản',
      'updated_at': 'Cập nhật lần cuối'
    };
    return fieldNames[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getFieldIcon = (key: string) => {
    switch (key) {
      case 'email': return Mail;
      case 'phone': return Phone;
      case 'address': return MapPin;
      case 'date_of_birth': return Calendar;
      default: return User;
    }
  };

  const isEditableField = (key: string) => {
    const nonEditableFields = ['created_at', 'updated_at', 'medical_license', 'id'];
    return !nonEditableFields.includes(key);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 min-h-screen">
        <MainLayout>
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="animate-pulse">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </MainLayout>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 min-h-screen">
        <MainLayout>
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-red-500 mb-4">
                <X size={48} className="mx-auto" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Không thể tải hồ sơ</h2>
              <p className="text-gray-600">Vui lòng thử lại sau</p>
            </div>
          </div>
        </MainLayout>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(profileData.role);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 min-h-screen">
      <MainLayout>
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className={`bg-gradient-to-r ${getRoleColor(profileData.role)} p-8 relative`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                      <RoleIcon className="text-white" size={32} />
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                      <Camera size={12} className="text-gray-600" />
                    </button>
                  </div>
                  <div className="text-white">
                    <h1 className="text-2xl font-bold mb-1">
                    {profileData.profile?.full_name || profileData.profile?.name || 'Chưa cập nhật'}
                    </h1>
                    <div className="flex items-center space-x-2">
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-sm font-medium">
                          {profileData.role?.toUpperCase() || 'USER'}
                        </span>
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm opacity-90">Đang hoạt động</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
                    >
                      <Edit size={16} />
                      <span>Chỉnh sửa</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
                      >
                        <Save size={16} />
                        <span>Lưu</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
                      >
                        <X size={16} />
                        <span>Hủy</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
              <User className="text-blue-600" size={20} />
              <span>Thông tin cá nhân</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(profileData.profile || {})
              .filter(([key, value]) =>
                key !== "created_at" && value !== null && value !== undefined && value !== ""
              )
              .map(([key, value]) => {
                const FieldIcon = getFieldIcon(key);
                const fieldName = formatFieldName(key);
                const fieldValue = value !== null && value !== undefined ? String(value) : "—";
                const canEdit = isEditableField(key);

                return (
                  <div key={key} className="group">
                    <div className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors duration-200">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <FieldIcon className="text-white" size={16} />
                        </div>
                        <span className="font-medium text-gray-700">{fieldName}</span>
                      </div>
                      
                      {isEditing && canEdit ? (
                        <input
                          type={key === 'date_of_birth' ? 'date' : key === 'email' ? 'email' : 'text'}
                          value={editData[key] || ''}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder={`Nhập ${fieldName.toLowerCase()}`}
                        />
                      ) : (
                        <div className="text-gray-800 font-medium">
                          {key === 'date_of_birth'
                            ? new Date(value as string).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            : fieldValue}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="text-blue-600" size={16} />
                    <span className="text-sm font-medium text-gray-700">Tham gia</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {profileData.createdAt ? 
                      new Date(profileData.createdAt).toLocaleDateString('vi-VN') : 
                      'Không xác định'
                    }
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="text-green-600" size={16} />
                    <span className="text-sm font-medium text-gray-700">Vai trò</span>
                  </div>
                  <p className="text-sm text-gray-600 capitalize">
                    {profileData.role || 'Không xác định'}
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="text-orange-600" size={16} />
                    <span className="text-sm font-medium text-gray-700">Trạng thái</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Đang hoạt động</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </div>
  );
};

export default UserProfile;