
# 🇹🇭 คู่มือการ Deploy Smart Expense Tracker (ละเอียดทุกขั้นตอน)

หากคุณ Deploy แล้วแอปไม่ทำงาน หรือข้อมูลไม่ขึ้น ให้เช็คตามลำดับนี้ครับ:

## ⚠️ วิธีแก้ปัญหาหน้าจอขาว (White Screen) หลัง Deploy
หากคุณเปิดแอปบน Vercel แล้วเจอหน้าจอขาวโล่ง หรือตรวจพบว่าโฟลเดอร์ `dist` มีแค่ `index.html` เปล่าๆ สาเหตุเกิดจากระบบ Build ไม่สามารถเชื่อมต่อกับโค้ด JavaScript ได้:
1. **ตรวจสอบไฟล์ `index.html`:** ตรวจสอบว่ามีบรรทัด `<script type="module" src="/index.tsx"></script>` ก่อนปิดแท็ก `</body>` หรือไม่ (ในเวอร์ชันล่าสุดผมใส่ไว้ให้แล้ว)
2. **การตั้งค่า Vercel:** หากคุณเพิ่งเพิ่ม **Environment Variables** (เช่น API_KEY) คุณต้องไปที่เมนู **Deployments** แล้วกดปุ่ม **"Redeploy"** เสมอ! เพราะ Vercel จะไม่ดึงค่าใหม่เข้าไปในแอปที่ Build เสร็จไปแล้ว
3. **ตรวจสอบ Console:** กด F12 หรือคลิกขวา > Inspect > Console หากเจอ Error เกี่ยวกับ `404 index.tsx` ให้เช็คว่าโครงสร้างไฟล์ใน GitHub ของคุณไม่ได้อยู่ในโฟลเดอร์ซ้อน (เช่น `src/index.tsx`) แต่ต้องอยู่ที่ Root ของโปรเจกต์ครับ

---

## 1. ตั้งค่า Firebase (หลังบ้าน)
1. เข้าไปที่ [Firebase Console](https://console.firebase.google.com/)
2. สร้างโปรเจกต์ใหม่ (จำชื่อโปรเจกต์ไว้)
3. ไปที่เมนู **Firestore Database** > กด **Create Database**
   - **สำคัญมาก:** เลือก **Start in test mode**
   - เลือก Location เป็น `asia-southeast1` (Singapore)
4. ไปที่ **Project Settings** (รูปเฟือง) > เลื่อนลงมาล่างสุด กดไอคอน `</>` เพื่อสร้าง **Web App**
   - **ไม่ต้องติ๊ก** "Also set up Firebase Hosting"
   - ก๊อปปี้ค่าใน `const firebaseConfig = { ... }` ไว้

## 2. ตั้งค่า Gemini API Key
1. ไปที่ [Google AI Studio](https://aistudio.google.com/)
2. กดปุ่ม **"Create API key"**
3. **การเลือกโปรเจกต์:** เลือกโปรเจกต์เดียวกับใน Firebase (ถ้าหาเจอ) หรือกด **"Create API key in new project"**
4. ก๊อปปี้ API Key (ที่ขึ้นต้นด้วย AIza...) ไว้

## 3. การตั้งค่าใน Vercel (จุดที่สำคัญที่สุด)
ไปที่หน้าโปรเจกต์ใน Vercel > **Settings > Environment Variables** ใส่ค่าให้ครบ:

| Key | Value |
| :--- | :--- |
| `API_KEY` | (จาก Google AI Studio) |
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

**⚠️ ย้ำอีกครั้ง:** เมื่อใส่ค่าครบแล้ว ต้องไปที่เมนู **Deployments** แล้วกด **"Redeploy"** อีกครั้งเสมอ!

## 4. วิธีเช็คสถานะ
- **จุดสีเขียว (Cloud Sync):** เชื่อมต่อ Firebase สำเร็จ ข้อมูลจะถูกเก็บออนไลน์
- **จุดสีเหลือง (Local Mode):** ยังเชื่อม Firebase ไม่ติด หรือยังไม่ได้ใส่ Environment Variables ข้อมูลจะเก็บแค่ในเครื่อง (IndexedDB)
- **สแกนใบเสร็จไม่ได้:** เช็คว่าใส่ `API_KEY` ใน Vercel ถูกต้องหรือไม่

---
*หากติดปัญหาตรงไหน สามารถสอบถามเพิ่มเติมได้เลยครับ!*
