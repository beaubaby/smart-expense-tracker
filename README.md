
# 🇹🇭 คู่มือการ Deploy Smart Expense Tracker (ละเอียดทุกขั้นตอน)

หากคุณ Deploy แล้วแอปไม่ทำงาน หรือข้อมูลไม่ขึ้น ให้เช็คตามลำดับนี้ครับ:

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
3. **การเลือกโปรเจกต์:**
   - ในช่องค้นหา ให้พิมพ์ชื่อ **โปรเจกต์เดียวกับที่สร้างใน Firebase** แล้วเลือกอันนั้น (แนะนำ)
   - หรือถ้าหาไม่เจอ ให้กด **"Create API key in new project"** ก็ได้ครับ
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

**⚠️ สำคัญ:** เมื่อใส่ค่าครบแล้ว ต้องไปที่เมนู **Deployments** แล้วกด **"Redeploy"** อีกครั้งเสมอ!

## 4. วิธีเช็คสถานะ
- **จุดสีเขียว (Cloud Sync Active):** เชื่อมต่อ Firebase สำเร็จ ข้อมูลจะถูกเก็บออนไลน์
- **จุดสีเหลือง (Local Testing Mode):** ยังเชื่อม Firebase ไม่ติด ข้อมูลจะเก็บแค่ในเครื่องคุณชั่วคราว
- **สแกนใบเสร็จไม่ได้:** เช็คว่าใส่ `API_KEY` ใน Vercel ถูกต้องหรือไม่

---
*หากติดปัญหาตรงไหน สามารถสอบถามเพิ่มเติมได้เลยครับ!*
