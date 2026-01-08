# 🇹🇭 Smart Expense Tracker: คู่มือการติดตั้งและแก้ปัญหา

แอปพลิเคชันนี้ใช้ระบบ **Cloud-First Architecture** โดยเก็บข้อมูลบน **MongoDB Atlas** เพื่อให้ข้อมูลของคุณปลอดภัย ไม่หายแม้ล้างเครื่องหรือเปลี่ยนเบราว์เซอร์ โดยมี **IndexedDB** สำรองไว้เพื่อการเข้าถึงข้อมูลแบบ Offline

---

## 🛠 1. วิธีตั้งค่า MongoDB Atlas (ป้องกันข้อมูลหาย)

หากคุณไม่ทำขั้นตอนนี้ ข้อมูลจะถูกเก็บในเบราว์เซอร์ชั่วคราวและหายได้หากล้างประวัติการเข้าชม

1. **สร้างฐานข้อมูล:** ไปที่ [MongoDB Atlas Console](https://cloud.mongodb.com/) > เลือกโปรเจกต์ของคุณ > **Create Cluster** > เลือก **M0 (Free)** tier.
2. **เลือก Region:** เลือก **Asia Pacific (Singapore - ap-southeast-1)** เพื่อความเร็วสูงสุดในไทย.
3. **สร้าง Database User:** 
   - ไปที่ **Database Access** > **Add New Database User**
   - ตั้งชื่อ username (เช่น `beauham4t_db_user`)
   - ตั้ง password อย่างปลอดภัย
   - เลือก **Built-in Role: Atlas Admin**
   - กด **Add User**.
4. **สร้าง Collection:**
   - ไปที่ **Databases** > กดชื่อ cluster ของคุณ
   - กด **Create Database** > ตั้งชื่อ `expense-tracker`
   - ตั้งชื่อ Collection `expenses`
   - กด **Create**.
5. **รับ Connection String:**
   - ไปที่ **Clusters** > กด **Connect** บน cluster ของคุณ
   - เลือก **Drivers** > **Node.js**
   - คัดลอก Connection String ที่มีรูปแบบ:
     ```
     mongodb+srv://username:password@cluster.mongodb.net/?appName=smart-expense-tracker-prod
     ```
   - จะใช้ค่านี้ในขั้นตอนที่ 2

---

## ☁️ 2. วิธีเชื่อมต่อกับ Vercel (Production Mode)

หลังจากได้ MongoDB Connection String ให้นำค่าไปใส่ใน **Vercel > Settings > Environment Variables**:

| Vercel Key | ค่าที่ต้องใส่ (จาก MongoDB Atlas) |
| :--- | :--- |
| `VITE_MONGODB_URI` | MongoDB Connection String (เช่น `mongodb+srv://...`) |

**⚠️ สำคัญที่สุด:** เมื่อเพิ่ม Environment Variables ใน Vercel เสร็จแล้ว **"ต้องกด Redeploy"** เสมอ! โดยไปที่หน้า Deployments > กดปุ่ม `...` หลังรายการล่าสุด > เลือก **Redeploy**. หากไม่ทำเช่นนี้ แอปจะไม่สามารถเชื่อมต่อกับ MongoDB ได้

---

## ❓ 3. ถาม-ตอบ ปัญหาที่พบบ่อย

### ถาม: ทำไม Deploy แล้วหน้าจอขาว (White Screen)?
**ตอบ:** สาเหตุส่วนใหญ่เกิดจาก Vercel Build ไม่สำเร็จ หรือหาไฟล์ `index.tsx` ไม่เจอ ให้ตรวจสอบว่า:
1. ไฟล์ `index.html` มีบรรทัด `<script type="module" src="/index.tsx"></script>` อยู่ที่ส่วนท้าย.
2. ตรวจสอบว่าชื่อไฟล์ใน GitHub เป็นตัวเล็ก-ใหญ่ตรงกับในโค้ดหรือไม่ (Linux บน Vercel ตรวจสอบตัวอักษรพิมพ์เล็ก-ใหญ่เข้มงวด).
3. ตรวจสอบว่า `VITE_MONGODB_URI` มีค่าใน Vercel Environment Variables หรือไม่.

### ถาม: ทำไมข้อมูลเดิมที่เคยบันทึกไว้หายไป?
**ตอบ:** หากคุณสลับจากเครื่องหนึ่งไปอีกเครื่องหนึ่งโดยที่ยังไม่ได้ตั้งค่า MongoDB ข้อมูลจะเก็บในเครื่องนั้นๆ เท่านั้น (IndexedDB) การตั้งค่า Cloud ตามข้อ 1 และ 2 จะช่วยให้ข้อมูลเชื่อมกันทุกเครื่อง.

### ถาม: "Cannot connect to MongoDB" error?
**ตอบ:** ตรวจสอบว่า:
1. `VITE_MONGODB_URI` ถูกต้องและมีค่าใน Vercel Environment Variables
2. MongoDB User ที่สร้างมีสิทธิ์ที่เพียงพอ (Atlas Admin)
3. Network Access ใน MongoDB Atlas เปิดอนุญาต (โดยปกติจะเป็น "Allow access from anywhere")
4. Connection String มี username:password ที่ถูกต้อง
