export {};

declare global {
    interface AccessLog {
        log_id: number; // 日誌 ID
        access_time: string; // 訪問時間，ISO 格式的字符串（例如 "2025-02-15T09:00:00"）
        direction: "in" | "out"; // 訪問方向，值為 'in' 或 'out'
        gate_name: string; // 門的名稱
        gate_type: string; // 門的類型
    }
}
