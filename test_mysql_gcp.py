import mysql.connector

# 建立連線
conn = mysql.connector.connect(
    host="34.81.255.90",
    user="root",
    password="Aa70616188",
    database="in_out_system_mysql",
    port=3306
)

cursor = conn.cursor(dictionary=True)

# 查出是 admin 的人
cursor.execute("SELECT employee_id, hashed_password, first_name FROM Employee WHERE is_admin = 1")

rows = cursor.fetchall()

print("✅ Admin 使用者：")
for row in rows:
    print(row)

cursor.close()
conn.close()
