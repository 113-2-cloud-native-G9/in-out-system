import numpy as np
import random
import base64
import json
import time
from datetime import datetime, timedelta
from google.cloud import pubsub_v1

# ===== 基本設定 =====
NUM_EMPLOYEES = 50
EMPLOYEE_IDS = [f"EMP{str(i).zfill(5)}" for i in range(1, NUM_EMPLOYEES + 1)]
GATE_IN_IDS = [1, 3, 5, 7]
GATE_OUT_IDS = [2, 4, 6]

PROJECT_ID = "causal-port-454215-g1"
TOPIC_ID = "in-out-system-pubsub"

publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(PROJECT_ID, TOPIC_ID)

# ===== 模擬分布函數 =====
def generate_minutes(start_time, end_time):
    return [start_time + timedelta(minutes=i) for i in range(int((end_time - start_time).total_seconds() // 60))]

def generate_flow_distribution(times, flows, count):
    prob = flows / flows.sum()
    chosen = np.random.choice(times, size=count, p=prob, replace=True)
    return list(chosen)

def gen_checkin_times(count):
    start = datetime.strptime("07:00", "%H:%M")
    end = datetime.strptime("09:00", "%H:%M")
    peak = datetime.strptime("08:00", "%H:%M")
    k1, k2, A = 0.2, 0.9, 300
    times = generate_minutes(start, end)
    minutes = np.array([(t - peak).total_seconds() / 60 for t in times])
    flow = np.where(minutes < 0, A * np.exp(k1 * minutes), A * np.exp(-k2 * minutes))
    return generate_flow_distribution(times, flow, count)

def gen_checkout_times(count):
    start = datetime.strptime("17:00", "%H:%M")
    end = datetime.strptime("19:00", "%H:%M")
    peak = datetime.strptime("17:10", "%H:%M")
    k, A = 0.7, 300
    times = generate_minutes(start, end)
    minutes = np.array([(t - peak).total_seconds() / 60 for t in times])
    flow = np.where(minutes < 0, 0, A * np.exp(-k * minutes))
    return generate_flow_distribution(times, flow, count)

def get_workdays(start_date, end_date):
    days = []
    current = start_date
    while current <= end_date:
        if current.weekday() < 5:  # Mon–Fri
            days.append(current.date())
        current += timedelta(days=1)
    return days

# ===== 發送到 Pub/Sub =====
def publish_to_pubsub(data_dict):
    json_str = json.dumps(data_dict)
    json_bytes = json_str.encode("utf-8")
    future = publisher.publish(topic_path, data=json_bytes)
    message_id = future.result()
    print(f"✅ 發送成功：{data_dict['employee_id']} @ {data_dict['access_time']} | msgID: {message_id}")

# ===== 主程式 =====
start_date = datetime(2025, 5, 1)
end_date = datetime(2025, 5, 18)
workdays = get_workdays(start_date, end_date)

print(f"📅 產生日期：{workdays}")
total_sent = 0

for day in workdays:
    print(f"📆 正在處理：{day}")
    checkin_times = gen_checkin_times(NUM_EMPLOYEES)
    checkout_times = gen_checkout_times(NUM_EMPLOYEES)

    for i, emp_id in enumerate(EMPLOYEE_IDS):
        checkin_dt = datetime.combine(day, checkin_times[i].time())
        gate_in = random.choice(GATE_IN_IDS)
        data_in = {
            "employee_id": emp_id,
            "access_time": checkin_dt.isoformat(),
            "gate_id": gate_in
        }
        publish_to_pubsub(data_in)
        time.sleep(0.003)

        checkout_dt = datetime.combine(day, checkout_times[i].time())
        gate_out = random.choice(GATE_OUT_IDS)
        data_out = {
            "employee_id": emp_id,
            "access_time": checkout_dt.isoformat(),
            "gate_id": gate_out
        }
        publish_to_pubsub(data_out)
        time.sleep(0.003)

        total_sent += 2

print(f"🎉 完成！總共送出 {total_sent} 筆資料到 Pub/Sub。")