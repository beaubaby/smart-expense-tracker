
# 🇹🇭 คู่มือการ Deploy Smart Expense Tracker (ละเอียดทุกขั้นตอน)

หากคุณ Deploy แล้วแอปไม่ทำงาน หรือข้อมูลไม่ขึ้น ให้เช็คตามลำดับนี้ครับ:

## 1. ตั้งค่า Firebase (หลังบ้าน)
1. เข้าไปที่ [Firebase Console](https://console.firebase.google.com/)
2. สร้างโปรเจกต์ใหม่
3. ไปที่เมนู **Firestore Database** > กด **Create Database**
   - **สำคัญมาก:** เลือก **Start in test mode** (เพื่อให้แอปเขียนข้อมูลได้ทันที)
   - เลือก Location เป็น `asia-southeast1`
4. ไปที่ **Project Settings** (รูปเฟือง) > เลื่อนลงมาล่างสุด กดไอคอน `</>` เพื่อสร้าง **Web App**
5. ก๊อปปี้ค่าใน `firebaseConfig` ไว้ใช้ในขั้นตอนถัดไป

## 2. ตั้งค่าใน Vercel (จุดที่คนมักทำผิด)
เมื่อ Import โปรเจกต์เข้า Vercel แล้ว ให้ไปที่หน้า **Settings > Environment Variables** และเพิ่มค่าเหล่านี้ (Copy ชื่อไปวางให้ตรงเป๊ะ):

| ชื่อตัวแปร (Key) | ค่าที่ต้องใส่ (Value) |
| :--- | :--- |
| `API_KEY` | API Key จาก Google AI Studio (สำหรับ AI สแกนใบเสร็จ) |
| `VITE_FIREBASE_API_KEY` | ค่า `apiKey` จาก Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | ค่า `authDomain` จาก Firebase |
| `VITE_FIREBASE_PROJECT_ID` | ค่า `projectId` จาก Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | ค่า `storageBucket` จาก Firebase |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ค่า `messagingSenderId` จาก Firebase |
| `VITE_FIREBASE_APP_ID` | ค่า `appId` จาก Firebase |

**หลังจากใส่ครบแล้ว ให้กด "Redeploy" อีกรอบเพื่อให้ Vercel ดึงค่าใหม่ไปใช้ครับ**

## 3. วิธีเช็คว่าทำสำเร็จไหม?
- ถ้าเข้าหน้าเว็บแล้วเห็นคำว่า **"Cloud Sync Active"** (จุดสีเขียว) แปลว่าเชื่อมต่อสำเร็จ
- ถ้าขึ้น **"Local Testing Mode"** (จุดสีเหลือง) แปลว่าลืมใส่ Environment Variables ใน Vercel
- ถ้าขึ้น **"Sync Error"** แปลว่าคุณอาจจะลืมเปิด Firestore ใน Firebase หรือตั้ง Rules เป็น Production mode ทำให้แอปอ่านข้อมูลไม่ได้

---
*หากติดปัญหาตรงไหน สามารถสอบถามเพิ่มเติมได้เลยครับ!*
