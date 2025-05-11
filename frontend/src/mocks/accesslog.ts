import { AccessLog } from "@/types/accesslog";

export const mockAccessLogs: Array<AccessLog> = [
    // 2025/3/25 的記錄
    {
        log_id: "101",
        access_time: "2025-03-25T08:30:00",
        direction: "in",
        gate_name: "Main Gate",
        gate_type: "Main Entrance",
    },
    {
        log_id: "102",
        access_time: "2025-03-25T12:00:00",
        direction: "out",
        gate_name: "Main Gate",
        gate_type: "Main Entrance",
    },
    {
        log_id: "103",
        access_time: "2025-03-25T13:00:00",
        direction: "in",
        gate_name: "Main Gate",
        gate_type: "Main Entrance",
    },
    {
        log_id: "104",
        access_time: "2025-03-25T18:15:00",
        direction: "out",
        gate_name: "Main Gate",
        gate_type: "Main Entrance",
    },
    {
        log_id: "105",
        access_time: "2025-03-25T08:45:00",
        direction: "in",
        gate_name: "Side Entrance",
        gate_type: "Parking",
    },
    {
        log_id: "106",
        access_time: "2025-03-25T17:30:00",
        direction: "out",
        gate_name: "Main Gate",
        gate_type: "Main Entrance",
    },
    {
        log_id: "107",
    
        access_time: "2025-03-25T09:00:00",
        direction: "in",
        gate_name: "East Wing",
        gate_type: "Staff Entrance",
    },
    {
        log_id: "108",
        
        access_time: "2025-03-25T11:30:00",
        direction: "out",
        gate_name: "East Wing",
        gate_type: "Staff Entrance",
 
    },
    {
        log_id: "109",
       
        access_time: "2025-03-25T12:30:00",
        direction: "in",
        gate_name: "Main Gate",
        gate_type: "Main Entrance",

    },
    {
        log_id: "110",
       
        access_time: "2025-03-25T16:45:00",
        direction: "out",
        gate_name: "Main Gate",
        gate_type: "Main Entrance",
  
    },
    {
        log_id: "111",

        access_time: "2025-03-25T08:15:00",
        direction: "in",
        gate_name: "Main Gate",
        gate_type: "Main Entrance",
        
    
    }
];
