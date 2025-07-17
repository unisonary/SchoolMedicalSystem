import { useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { Upload, FileSpreadsheet, Users, CheckCircle, XCircle, AlertCircle  } from "lucide-react";

const AdminImportExcel = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".xlsx") && !selectedFile.name.endsWith(".xls")) {
        toast.error("Chỉ chấp nhận file Excel (.xlsx hoặc .xls)");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Vui lòng chọn file Excel");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await axios.post(`/admin/import-users`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
      toast.success("Đã nhập người dùng xong");
    } catch (err: any) {
      toast.error(err?.response?.data || "Lỗi khi nhập dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const getResultStats = () => {
    if (result.length === 0) return { success: 0, error: 0, total: 0 };
    
    const success = result.filter(line => !line.includes("❌") && !line.includes("Lỗi")).length;
    const error = result.filter(line => line.includes("❌") || line.includes("Lỗi")).length;
    
    return { success, error, total: result.length };
  };

  const stats = getResultStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
          </div>
          📊 Nhập người dùng từ Excel
        </h2>
        <p className="text-gray-600">Tải lên file Excel để nhập nhiều người dùng cùng lúc vào hệ thống</p>
      </div>

      {/* Stats Cards */}
      {result.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Tổng số dòng</p>
                <p className="text-3xl font-bold text-blue-800">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Thành công</p>
                <p className="text-3xl font-bold text-green-800">{stats.success}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Thất bại</p>
                <p className="text-3xl font-bold text-red-800">{stats.error}</p>
              </div>
              <div className="p-3 bg-red-200 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
          <h3 className="text-xl font-semibold text-green-800 flex items-center space-x-2">
            <Upload className="w-5 h-5 text-green-600" />
            <span>Tải lên file Excel</span>
          </h3>
        </div>

        <div className="p-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">📋 Lưu ý quan trọng:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Chỉ chấp nhận file Excel (.xlsx hoặc .xls)</li>
                  <li>• File phải có định dạng cột chính xác</li>
                  <li>• Dữ liệu sẽ được kiểm tra và xác thực trước khi nhập</li>
                  <li>• Các dòng lỗi sẽ được hiển thị chi tiết</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn file Excel
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {file && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  <span>Đã chọn: {file.name}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleImport}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-md transition-all transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Upload className="w-4 h-4" />
              <span>{loading ? "Đang xử lý..." : "Nhập từ Excel"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-700 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-gray-600" />
                <span>📋 Kết quả nhập dữ liệu</span>
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {result.length} dòng
                </span>
              </h3>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                {result.map((line, index) => {
                  const isError = line.includes("❌") || line.includes("Lỗi");
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 p-3 rounded-lg border ${
                        isError 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {isError ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className={`text-sm flex-1 ${
                        isError ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {line}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Results State */}
      {result.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Chưa có kết quả nhập dữ liệu</p>
              <p className="text-gray-400 text-sm mt-2">Tải lên file Excel để xem kết quả tại đây</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminImportExcel;