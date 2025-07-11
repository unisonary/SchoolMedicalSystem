import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";


let debounceTimer: NodeJS.Timeout;

interface InventoryItem {
  itemId: number;
  itemName: string;
  quantity: number;
  unit: string;
}

interface SupplyItem {
  itemId: number;
  quantity: number;
  reason: string;
}

const NurseSupplyLog = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [supplyItems, setSupplyItems] = useState<SupplyItem[]>([
    { itemId: 0, quantity: 1, reason: "" },
  ]);

  const [referenceEventId, setReferenceEventId] = useState<number | null>(null);
  const [eventValid, setEventValid] = useState<boolean | null>(null);
  const [checkingEvent, setCheckingEvent] = useState<boolean>(false);

  const [logs, setLogs] = useState<any[]>([]);
  const [groupedLogs, setGroupedLogs] = useState<{ [eventId: number]: any[] }>(
    {}
  );
  const [eventDetails, setEventDetails] = useState<Map<number, any>>(
    new Map()
  );

  const [loading, setLoading] = useState(false);
  const [params] = useSearchParams();
  const initialEventId = Number(params.get("eventId"));

  // ----------------------------
  // Fetch dữ liệu
  // ----------------------------

  const fetchItems = async () => {
    try {
      const res = await axios.get("/nurse/inventory");
      setItems(res.data);
    } catch {
      toast.error("Không thể tải vật tư.");
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get("/nurse/supply-log");
      const data = res.data;

      const grouped = data.reduce((acc: any, log: any) => {
        const key = log.referenceEventId;
        if (!acc[key]) acc[key] = [];
        acc[key].push(log);
        return acc;
      }, {});
      setGroupedLogs(grouped);
      setLogs(data);

      await fetchEventInfoForLogs(data);
    } catch {
      toast.error("Không thể tải danh sách log.");
    }
  };

  const fetchEventInfoForLogs = async (logs: any[]) => {
    const eventIds = Array.from(new Set(logs.map((l) => l.referenceEventId)));
    const detailMap = new Map<number, any>();

    await Promise.all(
      eventIds.map(async (id) => {
        try {
          const res = await axios.get(`/nurse/medical-events/${id}`);
          detailMap.set(id, {
            studentName: res.data.studentName,
            eventType: res.data.eventType,
            eventDate: res.data.eventDate,
          });
        } catch {
          // skip deleted event
        }
      })
    );

    setEventDetails(detailMap);
  };

  const validateEventId = async (id: number) => {
    if (!id || id <= 0) {
      setEventValid(false);
      return;
    }

    setCheckingEvent(true);
    try {
      const res = await axios.get(`/nurse/medical-events/${id}`);
      setEventValid(!!res.data);
    } catch {
      setEventValid(false);
    } finally {
      setCheckingEvent(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchLogs();
    if (initialEventId) {
      setReferenceEventId(initialEventId);
      validateEventId(initialEventId);
    }
  }, []);

  // ----------------------------
  // Handle input debounce
  // ----------------------------

  const handleEventIdChange = (val: string) => {
    const id = Number(val);
    setReferenceEventId(id);
    clearTimeout(debounceTimer);
    if (id > 0) {
      debounceTimer = setTimeout(() => {
        validateEventId(id);
      }, 500);
    } else {
      setEventValid(null);
    }
  };

  // ----------------------------
  // Gửi log sử dụng vật tư
  // ----------------------------

  const handleSubmit = async () => {
    if (!referenceEventId || !eventValid) {
      toast.error("Mã sự kiện không hợp lệ.");
      return;
    }

    const valid = supplyItems.every(
      (i) => i.itemId && i.quantity > 0 && i.reason.trim()
    );
    if (!valid) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      setLoading(true);
      for (const item of supplyItems) {
        await axios.post("/nurse/supply-log", {
          itemId: item.itemId,
          quantity: item.quantity,
          reason: item.reason,
          referenceEventId,
        });
      }

      toast.success("Đã ghi nhận vật tư.");
      setSupplyItems([{ itemId: 0, quantity: 1, reason: "" }]);
      fetchItems();
      fetchLogs();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi ghi nhận.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // JSX
  // ----------------------------

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          🩺 Ghi nhận vật tư sử dụng
        </h2>
        <p className="text-gray-600">
          Theo dõi và quản lý việc sử dụng vật tư y tế
        </p>
      </div>

      {/* Nhập Mã Sự Kiện */}
      {!initialEventId && (
        <div className="bg-white rounded-xl border px-6 py-4">
          <label className="block mb-2 font-medium">Mã sự kiện y tế *</label>
          <input
            type="number"
            value={referenceEventId || ""}
            onChange={(e) => handleEventIdChange(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Nhập mã sự kiện (VD: 23)"
          />
          {checkingEvent && <p className="text-sm text-blue-600 mt-2">⏳ Đang kiểm tra...</p>}
          {eventValid === false && (
            <p className="text-sm text-red-600 mt-2">
              ❌ Không tìm thấy sự kiện y tế.
            </p>
          )}
          {eventValid === true && (
            <p className="text-sm text-green-600 mt-2">✅ Mã sự kiện hợp lệ</p>
          )}
        </div>
      )}

      {/* Ghi nhận vật tư */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        {supplyItems.map((item, index) => (
          <div key={index} className="grid grid-cols-3 gap-4">
            <select
              value={item.itemId}
              onChange={(e) => {
                const updated = [...supplyItems];
                updated[index].itemId = Number(e.target.value);
                setSupplyItems(updated);
              }}
              className="p-3 border rounded-lg"
            >
              <option value={0}>-- Chọn vật tư --</option>
              {items.map((i) => (
                <option key={i.itemId} value={i.itemId}>
                  {i.itemName} ({i.quantity} {i.unit})
                </option>
              ))}
            </select>

            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => {
                const updated = [...supplyItems];
                updated[index].quantity = Number(e.target.value);
                setSupplyItems(updated);
              }}
              className="p-3 border rounded-lg"
              placeholder="Số lượng"
            />

            <input
              type="text"
              value={item.reason}
              onChange={(e) => {
                const updated = [...supplyItems];
                updated[index].reason = e.target.value;
                setSupplyItems(updated);
              }}
              className="p-3 border rounded-lg"
              placeholder="Lý do sử dụng"
            />
          </div>
        ))}

        <div className="flex space-x-2">
          <button
            className="bg-blue-100 px-3 py-1 rounded"
            onClick={() =>
              setSupplyItems([
                ...supplyItems,
                { itemId: 0, quantity: 1, reason: "" },
              ])
            }
          >
            + Thêm vật tư
          </button>
          {supplyItems.length > 1 && (
            <button
              className="bg-red-100 px-3 py-1 rounded"
              onClick={() => setSupplyItems(supplyItems.slice(0, -1))}
            >
              - Xoá dòng
            </button>
          )}
        </div>

        <div className="text-right">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            {loading ? "Đang lưu..." : "Ghi nhận sử dụng"}
          </button>
        </div>
      </div>

      {/* Danh sách log */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📦 Lịch sử sử dụng vật tư ({logs.length})
        </h3>

        {logs.length === 0 ? (
          <p className="text-gray-500">Chưa có log nào.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedLogs).map(([eventId, logs]) => {
              const info = eventDetails.get(Number(eventId));
              if (!info) return null;

              return (
                <details
                  key={eventId}
                  className="border border-gray-200 rounded-lg"
                >
                  <summary className="bg-gray-50 hover:bg-gray-100 cursor-pointer px-5 py-3 flex justify-between items-center font-medium text-gray-800">
  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
    <span className="font-semibold text-gray-800">#Sự kiện {eventId}</span>
    <span className="text-sm text-gray-600">👤 {info.studentName}</span>
    <span className="text-sm text-gray-600">📌 {info.eventType}</span>
  </div>
  <span className="text-sm text-indigo-600 font-medium whitespace-nowrap">
    🧾 {(logs as any[]).length} vật tư
  </span>
</summary>

                  <div>
                    <div className="grid grid-cols-4 px-5 py-2 text-sm font-semibold text-gray-600 border-b">
                      <div>Vật tư</div>
                      <div>Số lượng</div>
                      <div>Lý do</div>
                      <div>Thời gian</div>
                    </div>

                    {(logs as any[]).map((log: any) => (
                      <div
                        key={log.logId}
                        className="grid grid-cols-4 px-5 py-2 text-sm border-b"
                      >
                        <div>{log.itemName}</div>
                        <div>{log.quantity}</div>
                        <div>{log.reason}</div>
                        <div>
                          {log.date
                            ? new Date(log.date).toLocaleString("vi-VN")
                            : "Không rõ"}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NurseSupplyLog;
