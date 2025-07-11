import { useEffect, useRef, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { Trash2, Pencil, AlertCircle, Package, Plus, Edit3, Archive, Calendar, RefreshCw, TrendingDown, TrendingUp, Activity } from "lucide-react";
import Modal from "@/components/ui/Modal";

interface InventoryItem {
  itemId: number;
  itemName: string;
  itemType: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  minimumStockLevel: number;
}

const defaultForm: Partial<InventoryItem> = {
  itemName: "",
  itemType: "",
  quantity: 0,
  unit: "",
  expiryDate: "",
  minimumStockLevel: 0,
};

const NurseInventory = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [form, setForm] = useState<Partial<InventoryItem>>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/nurse/inventory");
      setItems(res.data);
    } catch {
      toast.error("Không thể tải danh sách vật tư.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async () => {
    if (!form.itemName || !form.itemType || !form.unit || !form.expiryDate) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`/nurse/inventory/${editingId}`, {
          quantity: form.quantity,
          minimumStockLevel: form.minimumStockLevel,
        });
        toast.success("Đã cập nhật vật tư.");
      } else {
        await axios.post("/nurse/inventory", form);
        toast.success("✅ Đã thêm vật tư mới.");
      }
      setForm(defaultForm);
      setEditingId(null);
      fetchItems();
    } catch {
      toast.error("❌ Lỗi khi lưu vật tư.");
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setForm({
      itemName: item.itemName,
      itemType: item.itemType,
      unit: item.unit,
      expiryDate: item.expiryDate,
      quantity: item.quantity,
      minimumStockLevel: item.minimumStockLevel,
    });
    setEditingId(item.itemId);

    // Scroll lên form sau khi state đã cập nhật
    setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100); // Delay nhỏ để đảm bảo UI đã render
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await axios.delete(`/nurse/inventory/${itemToDelete}`);
      toast.success("🗑️ Đã xoá vật tư.");
      setShowDeleteModal(false);
      setItemToDelete(null);
      fetchItems();
    } catch {
      toast.error("Không thể xoá vật tư.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(defaultForm);
  };

  const getExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysDiff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (daysDiff < 0) return { color: "text-red-600 bg-red-100", text: "Đã hết hạn" };
    if (daysDiff <= 7) return { color: "text-orange-600 bg-orange-100", text: `Còn ${daysDiff} ngày` };
    if (daysDiff <= 30) return { color: "text-yellow-600 bg-yellow-100", text: `Còn ${daysDiff} ngày` };
    return { color: "text-green-600 bg-green-100", text: `Còn ${daysDiff} ngày` };
  };

  const getStockStatus = (quantity: number, minimumStockLevel: number) => {
    if (quantity <= 0) return { color: "text-red-600 bg-red-100", icon: <AlertCircle className="w-4 h-4" /> };
    if (quantity <= minimumStockLevel) return { color: "text-orange-600 bg-orange-100", icon: <TrendingDown className="w-4 h-4" /> };
    return { color: "text-green-600 bg-green-100", icon: <TrendingUp className="w-4 h-4" /> };
  };

  const getTypeIcon = (itemType: string) => {
    if (itemType === "Thuốc") return <Activity className="w-4 h-4 text-blue-500" />;
    return <Package className="w-4 h-4 text-purple-500" />;
  };

  // Calculate stats
  const lowStockItems = items.filter(item => item.quantity <= item.minimumStockLevel);
  const expiringSoonItems = items.filter(item => {
    const daysDiff = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return daysDiff <= 7 && daysDiff >= 0;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📦 Quản lý kho vật tư y tế</h2>
        <p className="text-gray-600">Theo dõi và quản lý kho vật tư, thuốc men trong trường học</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Tổng vật tư</h3>
              <p className="text-2xl font-bold text-blue-600">{items.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-800">Sắp hết hàng</h3>
              <p className="text-2xl font-bold text-orange-600">{lowStockItems.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Sắp hết hạn</h3>
              <p className="text-2xl font-bold text-red-600">{expiringSoonItems.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Archive className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Tổng số lượng</h3>
              <p className="text-2xl font-bold text-green-600">{items.reduce((sum, item) => sum + item.quantity, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={fetchItems}
          disabled={loading}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? "Đang tải..." : "Làm mới"}</span>
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg" ref={formRef}>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            {editingId ? <Edit3 className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-blue-500" />}
            <span>{editingId ? "Cập nhật vật tư" : "Thêm vật tư mới"}</span>
          </h3>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {!editingId && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tên vật tư</label>
                  <input
                    placeholder="Nhập tên vật tư"
                    value={form.itemName}
                    onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Loại vật tư</label>
                  <select
                    value={form.itemType}
                    onChange={(e) => setForm({ ...form, itemType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">-- Chọn loại vật tư --</option>
                    <option value="Vật tư y tế">Vật tư y tế</option>
                    <option value="Thuốc">Thuốc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Đơn vị tính</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">-- Chọn đơn vị --</option>
                    <option value="cái">cái</option>
                    <option value="viên">viên</option>
                    <option value="chai">chai</option>
                    <option value="cuộn">cuộn</option>
                    <option value="hộp">hộp</option>
                    <option value="lọ">lọ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hạn sử dụng</label>
                  <input
                    type="datetime-local"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min={new Date(Date.now() + 86400000).toISOString().slice(0, 16)}
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Số lượng</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nhập số lượng"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ngưỡng cảnh báo</label>
              <input
                type="number"
                value={form.minimumStockLevel}
                onChange={(e) => setForm({ ...form, minimumStockLevel: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Nhập ngưỡng cảnh báo"
                min="0"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            {editingId && (
              <button
                onClick={cancelEdit}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Huỷ
              </button>
            )}
            <button
              onClick={handleSubmit}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              {editingId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              <span>{editingId ? "Cập nhật" : "Thêm mới"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Archive className="w-5 h-5 text-purple-500" />
            <span>Danh sách vật tư trong kho</span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
              {items.length}
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
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Chưa có vật tư nào trong kho</p>
              <p className="text-gray-400 text-sm mt-2">Hãy thêm vật tư mới để bắt đầu quản lý kho</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-700">STT</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Tên vật tư</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Loại</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Số lượng</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Đơn vị</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Hạn sử dụng</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Cảnh báo</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const expiryStatus = getExpiryStatus(item.expiryDate);
                    const stockStatus = getStockStatus(item.quantity, item.minimumStockLevel);
                    return (
                      <tr key={item.itemId} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="p-4 font-medium text-gray-600">{index + 1}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {item.itemName.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-800">{item.itemName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(item.itemType)}
                            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                              {item.itemType}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}>
                              {stockStatus.icon}
                              <span>{item.quantity}</span>
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-gray-600 text-sm">{item.unit}</span>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span className="text-xs">
                                {new Date(item.expiryDate).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full font-medium ${expiryStatus.color}`}>
                              {expiryStatus.text}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                            {item.minimumStockLevel}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-3 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setItemToDelete(item.itemId);
                                setShowDeleteModal(true);
                              }}
                              className="flex items-center space-x-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium px-3 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Xác nhận xoá vật tư">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="font-semibold text-red-800">Bạn có chắc chắn muốn xoá vật tư này?</p>
              <p className="text-sm text-red-600 mt-1">Hành động này không thể hoàn tác và sẽ xoá hoàn toàn thông tin vật tư khỏi hệ thống.</p>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Huỷ
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
            >
              Xoá vật tư
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NurseInventory;