✅ ข้อควรจำเมื่อใช้ Drizzle relations()
หลักการ รายละเอียด

1. relations() ใช้ได้ ครั้งเดียวต่อ table ใส่ทุกความสัมพันธ์ (one/many) ใน object เดียว
2. import schema ให้ตรง ใช้ path ตรงๆ เช่น ../schema/menus แทนการ import แบบรวม (..)
3. ระวัง circular imports อย่า import schema ข้ามกันเป็นวง เช่น orders -> orderItems -> orders
4. ตรวจสอบ fields และ references ต้อง match ชนิดและชื่อกับ schema จริง
