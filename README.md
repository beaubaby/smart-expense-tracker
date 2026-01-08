# 🇹🇭 Smart Expense Tracker: คู่มือการติดตั้งและแก้ปัญหา

แอปพลิเคชันนี้ใช้ระบบ **Cloud-First Architecture** โดยเก็บข้อมูลบน **Firebase Firestore** เพื่อให้ข้อมูลของคุณปลอดภัย ไม่หายแม้ล้างเครื่องหรือเปลี่ยนเบราว์เซอร์

---

## 🛠 1. วิธีตั้งค่า Firebase Firestore (ป้องกันข้อมูลหาย)

หากคุณไม่ทำขั้นตอนนี้ ข้อมูลจะถูกเก็บในเบราว์เซอร์ชั่วคราวและหายได้หากล้างประวัติการเข้าชม

1. **สร้างฐานข้อมูล:** ไปที่ [Firebase Console](https://console.firebase.google.com/) > เลือกโปรเจกต์ของคุณ > **Firestore Database**.
2. **กด Create Database:** เลือก Location เป็น **asia-southeast1 (Singapore)** เพื่อความเร็วสูงสุดในไทย.
3. **ตั้งค่า Security Rules (สำคัญมาก!):** 
   - ไปที่แท็บ **Rules**
   - เปลี่ยนโค้ดให้เป็นตามด้านล่างนี้เพื่อให้แอปเขียนข้อมูลได้ตลอดไป:
     ```javascript
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if true;
         }
       }
     }
     ```
   - กด **Publish**.

---

## ☁️ 2. วิธีเชื่อมต่อกับ Vercel (Production Mode)

หลังจากได้ Config จาก Firebase (Settings > Your Apps) ให้นำค่าไปใส่ใน **Vercel > Settings > Environment Variables**:

| Vercel Key | ค่าที่ต้องใส่ (จาก Firebase) |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| ... และค่าอื่นๆ ... | ... ตามที่ระบุในแอป ... |

**⚠️ สำคัญที่สุด:** เมื่อเพิ่ม Environment Variables ใน Vercel เสร็จแล้ว **"ต้องกด Redeploy"** เสมอ! โดยไปที่หน้า Deployments > กดปุ่ม `...` หลังรายการล่าสุด > เลือก **Redeploy**. หากไม่ทำเช่นนี้ แอปจะยังคงทำงานใน Local Mode (จุดเหลือง) และหาค่า Config ไม่เจอ

---

## ❓ 3. ถาม-ตอบ ปัญหาที่พบบ่อย

### ถาม: ทำไม Deploy แล้วหน้าจอขาว (White Screen)?
**ตอบ:** สาเหตุส่วนใหญ่เกิดจาก Vercel Build ไม่สำเร็จ หรือหาไฟล์ `index.tsx` ไม่เจอ ให้ตรวจสอบว่า:
1. ไฟล์ `index.html` มีบรรทัด `<script type="module" src="/index.tsx"></script>` อยู่ที่ส่วนท้าย.
2. ตรวจสอบว่าชื่อไฟล์ใน GitHub เป็นตัวเล็ก-ใหญ่ตรงกับในโค้ดหรือไม่ (Linux บน Vercel ตรวจสอบตัวอักษรพิมพ์เล็ก-ใหญ่เข้มงวด).

### ถาม: ทำไมข้อมูลเดิมที่เคยบันทึกไว้หายไป?
**ตอบ:** หากคุณสลับจากเครื่องหนึ่งไปอีกเครื่องหนึ่งโดยที่ยังไม่ได้ตั้งค่า Firebase ข้อมูลจะเก็บในเครื่องนั้นๆ เท่านั้น การตั้งค่า Cloud ตามข้อ 1 และ 2 จะช่วยให้ข้อมูลเชื่อมกันทุกเครื่อง.

### ถาม: จุดสีเหลือง (Local Mode) ไม่เปลี่ยนเป็นสีเขียว?
**ตอบ:** แสดงว่าแอปหาค่า Config จาก Vercel ไม่เจอ ให้เช็คว่าพิมพ์ชื่อ Key (เช่น `VITE_FIREBASE_API_KEY`) ถูกต้องทุกตัวอักษร และทำการ **Redeploy** แล้วหรือยัง.
