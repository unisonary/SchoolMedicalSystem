import { useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { useAuthStore } from "@/auth/useAuthStore";

const AdminImportExcel = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

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

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Nhập người dùng từ Excel</h2>

      <div className="space-y-2">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="border px-4 py-2 rounded text-sm w-full sm:w-1/2"
        />
        <button
          onClick={handleImport}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Nhập từ Excel"}
        </button>
      </div>

      {result.length > 0 && (
        <div className="mt-4 border rounded bg-white p-4 max-h-[300px] overflow-y-auto text-sm space-y-1">
          {result.map((line, index) => (
            <p key={index} className={line.includes("❌") || line.includes("Lỗi") ? "text-red-500" : "text-green-600"}>
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminImportExcel;
