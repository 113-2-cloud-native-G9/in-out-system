# Version 1
# import numpy as np
# import random
# import base64
# import json
# import time
# from datetime import datetime, timedelta
# from google.cloud import pubsub_v1

# # ===== 基本設定 =====
# NUM_EMPLOYEES = 50
# EMPLOYEE_IDS = [f"EMP{str(i).zfill(5)}" for i in range(1, NUM_EMPLOYEES + 1)]
# GATE_IN_IDS = [1, 3, 5, 7]
# GATE_OUT_IDS = [2, 4, 6]

# PROJECT_ID = "causal-port-454215-g1"
# TOPIC_ID = "in-out-system-pubsub"

# publisher = pubsub_v1.PublisherClient()
# topic_path = publisher.topic_path(PROJECT_ID, TOPIC_ID)

# # ===== 模擬分布函數 =====
# def generate_minutes(start_time, end_time):
#     return [start_time + timedelta(minutes=i) for i in range(int((end_time - start_time).total_seconds() // 60))]

# def generate_flow_distribution(times, flows, count):
#     prob = flows / flows.sum()
#     chosen = np.random.choice(times, size=count, p=prob, replace=True)
#     return list(chosen)

# def gen_checkin_times(count):
#     start = datetime.strptime("07:00", "%H:%M")
#     end = datetime.strptime("09:00", "%H:%M")
#     peak = datetime.strptime("08:00", "%H:%M")
#     k1, k2, A = 0.2, 0.9, 300
#     times = generate_minutes(start, end)
#     minutes = np.array([(t - peak).total_seconds() / 60 for t in times])
#     flow = np.where(minutes < 0, A * np.exp(k1 * minutes), A * np.exp(-k2 * minutes))
#     return generate_flow_distribution(times, flow, count)

# def gen_checkout_times(count):
#     start = datetime.strptime("17:00", "%H:%M")
#     end = datetime.strptime("19:00", "%H:%M")
#     peak = datetime.strptime("17:10", "%H:%M")
#     k, A = 0.7, 300
#     times = generate_minutes(start, end)
#     minutes = np.array([(t - peak).total_seconds() / 60 for t in times])
#     flow = np.where(minutes < 0, 0, A * np.exp(-k * minutes))
#     return generate_flow_distribution(times, flow, count)

# def get_workdays(start_date, end_date):
#     days = []
#     current = start_date
#     while current <= end_date:
#         if current.weekday() < 5:  # Mon–Fri
#             days.append(current.date())
#         current += timedelta(days=1)
#     return days

# # ===== 發送到 Pub/Sub =====
# def publish_to_pubsub(data_dict):
#     json_str = json.dumps(data_dict)
#     json_bytes = json_str.encode("utf-8")
#     future = publisher.publish(topic_path, data=json_bytes)
#     message_id = future.result()
#     print(f"✅ 發送成功：{data_dict['employee_id']} @ {data_dict['access_time']} | msgID: {message_id}")

# # ===== 主程式 =====
# start_date = datetime(2025, 5, 1)
# end_date = datetime(2025, 5, 18)
# workdays = get_workdays(start_date, end_date)

# print(f"📅 產生日期：{workdays}")
# total_sent = 0

# for day in workdays:
#     print(f"📆 正在處理：{day}")
#     checkin_times = gen_checkin_times(NUM_EMPLOYEES)
#     checkout_times = gen_checkout_times(NUM_EMPLOYEES)

#     for i, emp_id in enumerate(EMPLOYEE_IDS):
#         checkin_dt = datetime.combine(day, checkin_times[i].time())
#         gate_in = random.choice(GATE_IN_IDS)
#         data_in = {
#             "employee_id": emp_id,
#             "access_time": checkin_dt.isoformat(),
#             "gate_id": gate_in
#         }
#         publish_to_pubsub(data_in)
#         time.sleep(0.003)

#         checkout_dt = datetime.combine(day, checkout_times[i].time())
#         gate_out = random.choice(GATE_OUT_IDS)
#         data_out = {
#             "employee_id": emp_id,
#             "access_time": checkout_dt.isoformat(),
#             "gate_id": gate_out
#         }
#         publish_to_pubsub(data_out)
#         time.sleep(0.003)

#         total_sent += 2

# print(f"🎉 完成！總共送出 {total_sent} 筆資料到 Pub/Sub。")


# Version 2
# import numpy as np
# import random
# import base64
# import json
# import time
# from datetime import datetime, timedelta
# from google.cloud import pubsub_v1

# # ===== 基本設定 =====
# NUM_EMPLOYEES = 50
# EMPLOYEE_IDS = [f"EMP{str(i).zfill(5)}" for i in range(1, NUM_EMPLOYEES + 1)]
# GATE_IN_IDS = [1, 3, 5, 7]
# GATE_OUT_IDS = [2, 4, 6]
# LATE_PROB = 0.01  # 1% chance of being late for check-in
# OVERTIME_PROB = 0.20  # 20% chance of overtime for check-out
# PROJECT_ID = "causal-port-454215-g1"
# TOPIC_ID = "in-out-system-pubsub"

# publisher = pubsub_v1.PublisherClient()
# topic_path = publisher.topic_path(PROJECT_ID, TOPIC_ID)

# # ===== 模擬分布函數 =====
# def generate_minutes(start_time, end_time):
#     return [start_time + timedelta(minutes=i) for i in range(int((end_time - start_time).total_seconds() // 60))]

# def generate_flow_distribution(times, flows, count):
#     prob = flows / flows.sum()
#     chosen = np.random.choice(times, size=count, p=prob, replace=True)
#     return list(chosen)

# def gen_checkin_times(count):
#     start = datetime.strptime("08:00", "%H:%M")
#     end = datetime.strptime("08:30", "%H:%M")
#     peak = datetime.strptime("08:20", "%H:%M")
#     k1, k2, A = 0.2, 0.9, 300
#     times = generate_minutes(start, end)
#     minutes = np.array([(t - peak).total_seconds() / 60 for t in times])
#     flow = np.where(minutes < 0, A * np.exp(k1 * minutes), A * np.exp(-k2 * minutes))
    
#     # Regular check-ins
#     num_regular = int(count * (1 - LATE_PROB))
#     regular_times = generate_flow_distribution(times, flow, num_regular)
    
#     # Late check-ins (up to 09:00)
#     num_late = count - num_regular
#     late_start = datetime.strptime("08:30", "%H:%M")
#     late_end = datetime.strptime("09:00", "%H:%M")
#     late_times = generate_minutes(late_start, late_end)
#     late_flow = np.ones(len(late_times))  # Uniform distribution for late arrivals
#     late_times = generate_flow_distribution(late_times, late_flow, num_late)
    
#     # Combine and add random jitter (up to ±3 minutes)
#     all_times = regular_times + late_times
#     all_times = [t + timedelta(minutes=random.uniform(-3, 3)) for t in all_times]
#     return all_times

# def gen_checkout_times(count):
#     start = datetime.strptime("17:30", "%H:%M")
#     end = datetime.strptime("19:00", "%H:%M")
#     peak = datetime.strptime("17:40", "%H:%M")
#     k, A = 0.5, 300  # Reduced k for slower decay (more spread)
#     times = generate_minutes(start, end)
#     minutes = np.array([(t - peak).total_seconds() / 60 for t in times])
#     flow = np.where(minutes < 0, 0, A * np.exp(-k * minutes))
    
#     # Regular check-outs
#     num_regular = int(count * (1 - OVERTIME_PROB))
#     regular_times = generate_flow_distribution(times, flow, num_regular)
    
#     # Overtime check-outs (19:00–21:00)
#     num_overtime = count - num_regular
#     overtime_start = datetime.strptime("19:00", "%H:%M")
#     overtime_end = datetime.strptime("21:00", "%H:%M")
#     overtime_times = generate_minutes(overtime_start, overtime_end)
#     overtime_flow = np.ones(len(overtime_times))  # Uniform distribution for overtime
#     overtime_times = generate_flow_distribution(overtime_times, overtime_flow, num_overtime)
    
#     # Combine and add random jitter (up to ±10 minutes)
#     all_times = regular_times + overtime_times
#     all_times = [t + timedelta(minutes=random.uniform(-10, 10)) for t in all_times]
#     return all_times

# def get_workdays(start_date, end_date):
#     days = []
#     current = start_date
#     while current <= end_date:
#         if current.weekday() < 5:  # Mon–Fri
#             days.append(current.date())
#         current += timedelta(days=1)
#     return days

# # ===== 發送到 Pub/Sub =====
# def publish_to_pubsub(data_dict):
#     json_str = json.dumps(data_dict)
#     json_bytes = json_str.encode("utf-8")
#     future = publisher.publish(topic_path, data=json_bytes)
#     message_id = future.result()
#     print(f"✅ 發送成功：{data_dict['employee_id']} @ {data_dict['access_time']} | msgID: {message_id}")

# # ===== 主程式 =====
# start_date = datetime(2025, 4, 1)
# end_date = datetime(2025, 4, 14)
# workdays = get_workdays(start_date, end_date)

# print(f"📅 產生日期：{workdays}")
# total_sent = 0

# for day in workdays:
#     print(f"📆 正在處理：{day}")
#     checkin_times = gen_checkin_times(NUM_EMPLOYEES)
#     checkout_times = gen_checkout_times(NUM_EMPLOYEES)

#     for i, emp_id in enumerate(EMPLOYEE_IDS):
#         checkin_dt = datetime.combine(day, checkin_times[i].time())
#         gate_in = random.choice(GATE_IN_IDS)
#         data_in = {
#             "employee_id": emp_id,
#             "access_time": checkin_dt.isoformat(),
#             "gate_id": gate_in
#         }
#         publish_to_pubsub(data_in)
#         time.sleep(0.003)

#         checkout_dt = datetime.combine(day, checkout_times[i].time())
#         gate_out = random.choice(GATE_OUT_IDS)
#         data_out = {
#             "employee_id": emp_id,
#             "access_time": checkout_dt.isoformat(),
#             "gate_id": gate_out
#         }
#         publish_to_pubsub(data_out)
#         time.sleep(0.003)

#         total_sent += 2

# print(f"🎉 完成！總共送出 {total_sent} 筆資料到 Pub/Sub。")

import numpy as np
import random
import json
import time
from datetime import datetime, timedelta
from google.cloud import pubsub_v1

# ===== Basic Settings =====
NUM_EMPLOYEES = 50
EMPLOYEE_IDS = [f"EMP{str(i).zfill(5)}" for i in range(1, NUM_EMPLOYEES + 1)]
GATE_IN_IDS = [1, 3, 5, 7]
GATE_OUT_IDS = [2, 4, 6]
BASE_LATE_PROB = 0.01  # Base late probability
BASE_OVERTIME_PROB = 0.20  # Base overtime probability
ABSENT_PROB = 0.01  # Base absent probability
PROJECT_ID = "causal-port-454215-g1"
TOPIC_ID = "in-out-system-pubsub"

publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(PROJECT_ID, TOPIC_ID)

# ===== Distribution Functions =====
def generate_minutes(start_time, end_time):
    return [start_time + timedelta(minutes=i) for i in range(int((end_time - start_time).total_seconds() // 60))]

def generate_flow_distribution(times, flows, count):
    prob = flows / flows.sum()
    chosen = np.random.choice(times, size=count, p=prob, replace=True)
    return list(chosen)

def gen_checkin_times(count, day_seed):
    random.seed(day_seed)
    peak_offset = random.uniform(-10, 10)  # Restored to ±10 for more variability
    start = datetime.strptime("08:00", "%H:%M")
    end = datetime.strptime("08:30", "%H:%M")
    peak = datetime.strptime("08:25", "%H:%M") + timedelta(minutes=peak_offset)
    
    k1 = random.uniform(0.15, 0.25)
    k2 = random.uniform(0.8, 1.0)
    A = random.uniform(250, 350)
    late_prob = random.uniform(BASE_LATE_PROB * 0.5, BASE_LATE_PROB * 1.5)
    
    times = generate_minutes(start, end)
    minutes = np.array([(t - peak).total_seconds() / 60 for t in times])
    flow = np.where(minutes < 0, A * np.exp(k1 * minutes), A * np.exp(-k2 * minutes))
    
    num_regular = int(count * (1 - late_prob))
    regular_times = generate_flow_distribution(times, flow, num_regular)
    
    num_late = count - num_regular
    late_start = datetime.strptime("08:30", "%H:%M")
    late_end = datetime.strptime("09:00", "%H:%M")
    late_times = generate_minutes(late_start, late_end)
    late_flow = np.ones(len(late_times))
    late_times = generate_flow_distribution(late_times, late_flow, num_late)
    
    all_times = regular_times + late_times
    all_times = [t + timedelta(minutes=random.uniform(-3, 3)) for t in all_times]
    return all_times, late_prob

def gen_checkout_times(count, day_seed):
    random.seed(day_seed + 1)
    peak_offset = random.uniform(-12, 15)
    start = datetime.strptime("17:30", "%H:%M")
    end = datetime.strptime("19:00", "%H:%M")
    peak = datetime.strptime("17:40", "%H:%M") + timedelta(minutes=peak_offset)
    
    k = random.uniform(0.4, 0.6)
    A = random.uniform(250, 350)
    overtime_prob = random.uniform(BASE_OVERTIME_PROB * 0.5, BASE_OVERTIME_PROB * 1.5)
    
    times = generate_minutes(start, end)
    minutes = np.array([(t - peak).total_seconds() / 60 for t in times])
    flow = np.where(minutes < 0, 0, A * np.exp(-k * minutes))
    
    num_regular = int(count * (1 - overtime_prob))
    regular_times = generate_flow_distribution(times, flow, num_regular)
    
    num_overtime = count - num_regular
    overtime_start = datetime.strptime("19:00", "%H:%M")
    overtime_end = datetime.strptime("21:00", "%H:%M")
    overtime_times = generate_minutes(overtime_start, overtime_end)
    overtime_flow = np.ones(len(overtime_times))
    overtime_times = generate_flow_distribution(overtime_times, overtime_flow, num_overtime)
    
    all_times = regular_times + overtime_times
    all_times = [t + timedelta(minutes=random.uniform(-10, 10)) for t in all_times]
    return all_times, overtime_prob

def get_workdays(start_date, end_date):
    days = []
    current = start_date
    while current <= end_date:
        if current.weekday() < 5:  # Mon–Fri
            days.append(current.date())
        current += timedelta(days=1)
    return days

# ===== Publish to Pub/Sub =====
def publish_to_pubsub(data_dict):
    try:
        json_str = json.dumps(data_dict)
        json_bytes = json_str.encode("utf-8")
        future = publisher.publish(topic_path, data=json_bytes)
        message_id = future.result()
        print(f"✅ Sent: {data_dict['employee_id']} @ {data_dict['access_time']} ({data_dict['type']}) | msgID: {message_id}")
    except Exception as e:
        print(f"❌ Failed to send: {data_dict['employee_id']} @ {data_dict['access_time']} | Error: {e}")

# ===== Main Program =====
start_date = datetime(2025, 4, 1)
end_date = datetime(2025, 4, 14)
workdays = get_workdays(start_date, end_date)

print(f"📅 Processing dates: {workdays}")
total_sent = 0

# Process each workday
for day in workdays:
    print(f"📆 Processing: {day}")
    
    random.seed(day.toordinal())
    absent_prob = random.uniform(ABSENT_PROB * 0.2, ABSENT_PROB * 1.2)
    present_employees = [emp_id for emp_id in EMPLOYEE_IDS if random.random() > absent_prob]
    num_present = len(present_employees)
    
    checkin_times, late_prob = gen_checkin_times(num_present, day.toordinal())
    checkout_times, overtime_prob = gen_checkout_times(num_present, day.toordinal())
    
    print(f"   - Employees present: {num_present}, Late prob: {late_prob:.3f}, Overtime prob: {overtime_prob:.3f}")
    
    for i, emp_id in enumerate(present_employees):  # Iterate over present_employees, not EMPLOYEE_IDS
        checkin_dt = datetime.combine(day, checkin_times[i].time())
        gate_in = random.choice(GATE_IN_IDS)
        data_in = {
            "employee_id": emp_id,
            "access_time": checkin_dt.isoformat(),
            "gate_id": gate_in,
            "type": "check-in"  # Added type field
        }
        publish_to_pubsub(data_in)
        time.sleep(0.003)
        
        checkout_dt = datetime.combine(day, checkout_times[i].time())
        gate_out = random.choice(GATE_OUT_IDS)
        data_out = {
            "employee_id": emp_id,
            "access_time": checkout_dt.isoformat(),
            "gate_id": gate_out,
            "type": "check-out"  # Added type field
        }
        publish_to_pubsub(data_out)
        time.sleep(0.003)
        
        total_sent += 2

print(f"🎉 Completed! Sent {total_sent} records to Pub/Sub.")