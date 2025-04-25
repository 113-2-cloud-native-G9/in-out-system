from google.cloud import pubsub_v1
import json
from datetime import datetime
import random
import time


PROJECT_ID = "causal-port-454215-g1"
TOPIC_ID = "in-out-system-pubsub"

# 建立 Publisher
publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(PROJECT_ID, TOPIC_ID)

# 員工與閘口資料（隨機）
EMPLOYEE_IDS = ['E014']
GATE_IDS = [1,2]

def generate_test_data():
    return {
        "employee_id": random.choice(EMPLOYEE_IDS),
        "access_time": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        "gate_id": random.choice(GATE_IDS)
    }

try:
    while True:
        test_data = generate_test_data()
        message_json = json.dumps(test_data)
        message_bytes = message_json.encode("utf-8")
        future = publisher.publish(topic_path, data=message_bytes)
        message_id = future.result()
        print(f"✅ 成功送出訊息！Message ID: {message_id}")
        print(f"內容：{message_json}")
        time.sleep(3)  # 每 10 秒送一筆

except KeyboardInterrupt:
    print("🛑 停止發送")
except Exception as e:
    print(f"❌ 發送失敗：{e}")