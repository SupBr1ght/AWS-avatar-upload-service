# AWS Avatar Upload Service

A backend microservice built with Node.js and Express for uploading user avatars to Amazon S3, queuing jobs via Amazon SQS, and (optionally) sending email notifications via Amazon SES.



##  Features

-  **Basic Auth** protected endpoint
-  Uploads images to **Amazon S3**
-  Sends messages to **Amazon SQS**
-  (Optional) Sends email via **Amazon SES**
-  Stores metadata in **MongoDB**
-  All logic runs inside one service (`server.js`)

---

##  Tech Stack

- Node.js + Express
- MongoDB
- AWS SDK (S3, SQS, SES)
- dotenv
- multer (file uploads)
- basic-auth

---


---

## 🛠 Setup & Run

### 1. Clone the project

```bash
git clone https://github.com/SupBr1ght/aws-avatar-upload-service.git
cd aws-avatar-upload-service


2. Install dependencies

npm install


3. Configure environment variables
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=eu-central-1
AWS_S3_BUCKET=your_bucket_name
AWS_SQS_URL=https://sqs.your-region.amazonaws.com/your-account/your-queue
EMAIL_FROM=no-reply@example.com
MONGODB_URI=mongodb+srv://your-cluster
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=securepassword

4. Start the server
npm start


📤 Upload Endpoint
POST /upload
Uploads an avatar image to S3 and queues a message to SQS.

Headers:

Authorization: Basic <base64(admin:password)>

Body (form-data):

avatar: image file

✅ Example with curl:
bash
Копировать
Редактировать
curl -X POST http://localhost:3000/upload \
  -H "Authorization: Basic $(echo -n 'admin:securepassword' | base64)" \
  -F "avatar=@./avatar.jpg"


📦 AWS Services Involved
- Service	Purpose
- S3	Stores uploaded avatars
- SQS	Queues avatar upload events
- SES	Sends email (optional, disabled)
- MongoDB	Saves awatars

⚠️ Notes!!!
Email via SES is currently disabled by default to avoid unwanted billing.
All logic, including the SQS listener, runs inside server.js — easy to deploy.
You can split the worker later for scalability.


