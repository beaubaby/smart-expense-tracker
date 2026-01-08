
# 🚀 Smart Expense Tracker: Cloud Setup Guide

แอปพลิเคชันนี้ถูกเปลี่ยนจากระบบเก็บข้อมูลในเครื่อง (LocalStorage/IndexedDB) มาเป็น **Firebase Firestore (Cloud)** เต็มรูปแบบ เพื่อให้ข้อมูลไม่หายเมื่อเปลี่ยนเครื่องหรือล้างเบราว์เซอร์

---

## 1. การตั้งค่า Firebase Firestore (ทำครั้งเดียว)

1. **สร้างโปรเจกต์:** เข้าไปที่ [Firebase Console](https://console.firebase.google.com/) แล้วกด "Add Project"
2. **สร้างฐานข้อมูล:** 
   - ไปที่เมนู **Firestore Database** (แถบซ้ายมือ)
   - กดปุ่ม **Create Database**
   - **สำคัญมาก:** เลือก **"Start in test mode"** เพื่อให้แอปสามารถเขียน/อ่านข้อมูลได้ทันที
   - เลือก Location เป็น `asia-southeast1` (Singapore) เพื่อความรวดเร็วในไทย
3. **ตั้งค่า Security Rules (สำคัญ!):**
   - ไปที่แท็บ **Rules** ในหน้า Firestore
   - หากคุณเลือก Test Mode ระบบจะอนุญาตให้ใช้ได้แค่ 30 วัน
   - เพื่อให้ใช้งานได้ตลอดไป (สำหรับใช้ส่วนตัว) ให้เปลี่ยนบรรทัด `allow read, write: if ...` เป็น:
     ```javascript
     allow read, write: if true;
     ```
   - แล้วกด **Publish**

## 2. การดึงค่า Config ไปใส่ใน Vercel

1. ใน Firebase Console ไปที่ **Project Settings** (รูปเฟืองมุมซ้ายบน)
2. เลื่อนลงมาที่ "Your apps" แล้วกดไอคอน `</>` (Web App)
3. ตั้งชื่อแอป (เช่น MyExpense) แล้วกด Register
4. ก๊อปปี้ค่าใน `const firebaseConfig = { ... }` มาเตรียมไว้
5. ไปที่หน้าโปรเจกต์ใน **Vercel > Settings > Environment Variables** แล้วเพิ่มค่าเหล่านี้:

| Vercel Key | ค่าที่ต้องก๊อปมาวาง (จาก Firebase Config) |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |
| `API_KEY` | (ค่า Gemini API Key จาก Google AI Studio) |

**⚠️ หลังจาก Save ค่าใน Vercel ครบแล้ว:** คุณต้องไปที่เมนู **Deployments** แล้วกดปุ่มจุดสามจุดหลังรายการล่าสุด เลือก **"Redeploy"** เพื่อให้แอปดึงค่าใหม่ไปใช้ครับ

---

## 3. วิธีเช็คว่าข้อมูลอยู่บน Cloud หรือยัง?
- สังเกตที่แถบด้านบนของแอป: 
  - 🟢 **Cloud Sync:** ข้อมูลบันทึกลง Google Cloud แล้ว ปลอดภัยแน่นอน
  - 🟡 **Local Mode:** ข้อมูลยังอยู่ในเครื่อง (เพราะยังตั้งค่า Firebase ไม่สำเร็จ)
- หากขึ้น Cloud Sync คุณสามารถลองเปิดเว็บนี้ในมือถือหรือคอมเครื่องอื่น แล้วจะเห็นข้อมูลเดียวกันทันทีครับ!
