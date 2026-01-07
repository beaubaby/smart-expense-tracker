
# ✨ Smart Expense Tracker (AI-Powered)

แอปพลิเคชันบันทึกรายจ่ายอัจฉริยะที่รวมพลังของ **Google Gemini AI** และ **Firebase Firestore** เข้าด้วยกัน เพื่อให้การจัดการการเงินของคุณเป็นเรื่องง่าย สะดวก และซิงค์ข้อมูลได้แบบ Real-time

## 🚀 ฟีเจอร์เด่น
- **AI Smart Scan:** ถ่ายรูปใบเสร็จหรือ Screenshot หน้าจอแชท/โอนเงิน แล้วให้ Gemini AI ช่วยสกัดข้อมูล (จำนวนเงิน, หมวดหมู่, วันที่) โดยอัตโนมัติ
- **Multi-Currency Support:** รองรับเงิน THB และ NZD พร้อมระบบคำนวณอัตราแลกเปลี่ยนอัตโนมัติ
- **Cloud Sync:** เก็บข้อมูลบน Firebase Firestore ข้อมูลไม่หาย ซิงค์ข้อมูลข้ามเครื่องได้ทันที
- **Visual Insights:** สรุปค่าใช้จ่ายด้วยกราฟวงกลม (Allocation) และกราฟแท่ง (Flow) แยกตามเดือน
- **CSV Export:** ส่งออกข้อมูลเป็นไฟล์ Excel/CSV เพื่อนำไปวิเคราะห์ต่อได้ง่ายๆ

---

## 🛠️ ขั้นตอนการตั้งค่า Firebase (Step-by-Step)

เพื่อให้แอปสามารถเก็บข้อมูลใน Cloud ได้ คุณต้องตั้งค่า Firebase ดังนี้:

1.  **สร้างโปรเจกต์:** ไปที่ [Firebase Console](https://console.firebase.google.com/) แล้วกด **"Add project"**
2.  **ลงทะเบียนเว็บ:** กดไอคอน **`</>` (Web)** เพื่อสร้าง App และก๊อปปี้ `firebaseConfig` ไว้
3.  **เปิดใช้งานฐานข้อมูล:** 
    - ที่เมนูซ้ายมือ เลือก **Firestore Database**
    - กด **Create database**
    - เลือก **Start in test mode** (เพื่อทดสอบเบื้องต้น)
    - เลือก Location เป็น **asia-southeast1** (สำหรับผู้ใช้ในไทย) แล้วกด Enable

---

## 🌐 การ Deploy บน Vercel

1.  **เตรียมโค้ด:** นำโปรเจกต์นี้ขึ้น GitHub Repository ของคุณ
2.  **เชื่อมต่อ Vercel:** ไปที่ [Vercel.com](https://vercel.com/) นำเข้าโปรเจกต์จาก GitHub
3.  **ตั้งค่า Environment Variables:** (สำคัญมาก) ในหน้าตั้งค่าก่อน Deploy ให้เพิ่มค่าต่อไปนี้:
    - `API_KEY`: รหัส Gemini API ของคุณ
    - `VITE_FIREBASE_API_KEY`: (จาก firebaseConfig)
    - `VITE_FIREBASE_AUTH_DOMAIN`: (จาก firebaseConfig)
    - `VITE_FIREBASE_PROJECT_ID`: (จาก firebaseConfig)
    - `VITE_FIREBASE_STORAGE_BUCKET`: (จาก firebaseConfig)
    - `VITE_FIREBASE_MESSAGING_SENDER_ID`: (จาก firebaseConfig)
    - `VITE_FIREBASE_APP_ID`: (จาก firebaseConfig)
4.  **Deploy:** กดปุ่ม **Deploy** แล้วรอจนเสร็จสิ้น

---

## 🔒 การตั้งค่าความปลอดภัย (Firestore Security Rules)

เมื่อทดสอบแอปเสร็จแล้วและต้องการใช้ในระยะยาว ควรเปลี่ยนสถานะจาก **Test Mode** เป็นสถานะที่ปลอดภัยขึ้น เพื่อป้องกันคนอื่นมาเขียนข้อมูลทับ

### วิธีตั้งค่า:
1.  ไปที่หน้า **Firebase Console** > **Firestore Database** > แท็บ **Rules**
2.  วางโค้ดด้านล่างนี้ลงไป (เลือกแบบที่เหมาะสมกับคุณ):

#### แบบที่ 1: ปิดการเข้าถึงจากสาธารณะ (ล็อคข้อมูล)
ใช้เมื่อต้องการให้แอปใช้งานได้เฉพาะผ่าน API Key ที่เรากำหนดเท่านั้น (จำกัดสิทธิ์พื้นฐาน)
```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /expenses/{document=**} {
      // อนุญาตเฉพาะผู้ที่มี API Key ถูกต้อง (ตั้งเงื่อนไขได้ตามความต้องการ)
      allow read, write: if request.auth != null; 
    }
  }
}
```

#### แบบที่ 2: ระบบระบุตัวตน (เมื่อคุณเพิ่ม Firebase Auth ในอนาคต)
หากคุณพัฒนาต่อโดยเพิ่มระบบ Login ให้ใช้กฎนี้เพื่อให้ "แต่ละคนเห็นเฉพาะข้อมูลของตัวเอง"
```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /expenses/{expenseId} {
      // อนุญาตให้อ่านและเขียนเฉพาะเอกสารที่มี userId ตรงกับผู้ที่ Login อยู่
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

---

## 📦 เทคโนโลยีที่ใช้
- **Frontend:** React (hooks, functional components)
- **Styling:** Tailwind CSS
- **AI Integration:** Google Generative AI (Gemini 3 Flash)
- **Database:** Firebase Firestore
- **Charts:** Recharts
- **Icons:** Lucide-style SVG icons

---
*Created with ❤️ for Smart Finance Management*
