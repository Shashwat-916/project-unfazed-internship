# API Routes and Expected Request Bodies

Here are the API routes (from `apps/api/routes/v1`) along with their expected `req.body` structures for testing:

### 🔐 Auth Routes (`/auth`)

**1. Send OTP**
- **Route:** `POST /auth/send-otp`
- **Body:**
```json
{
  "email": "user@gmail.com",
  "password": "yourpassword123"
}
```

**2. Verify OTP**
- **Route:** `POST /auth/verify-otp`
- **Body:**
```json
{
  "email": "user@gmail.com",
  "otp": "123456" 
}
```

**3. Register Client**
- **Route:** `POST /auth/register/client`
- **Body:**
```json
{
  "email": "client@gmail.com",
  "name": "John Doe",
  "phoneNumber": "1234567890" 
}
```

**4. Register Therapist**
- **Route:** `POST /auth/register/therapist`
- **Body:**
```json
{
  "email": "therapist@gmail.com",
  "name": "Jane Smith",
  "phoneNumber": "0987654321",
  "specialization": ["Cognitive Behavioral Therapy"], 
  "bio": ["Experienced therapist with 10 years of practice."], 
  "profileImage": "https://image.url", 
  "languages": ["English", "Spanish"] 
}
```
*(Note: `specialization`, `bio`, `profileImage`, and `languages` are optional).*

---

### 👤 Client Routes (`/client`)

**1. Update Client Profile**
- **Route:** `PATCH /client/me`
- **Body:**
```json
{
  "name": "Updated Name",
  "phoneNumber": "1112223333"
  // Add other client profile fields to update
}
```

---

### 👩‍⚕️ Therapist Routes (`/therapist`)

**1. Update Therapist Profile**
- **Route:** `PATCH /therapist/me`
- **Body:**
```json
{
  "name": "Updated Name",
  "specialization": ["Updated Specialization"],
  "bio": ["Updated bio content."]
  // Add other therapist profile fields to update
}
```

---

### 🛠️ Services Routes (`/services`)

**1. Create Service**
- **Route:** `POST /services/`
- **Body:**
```json
{
  "title": "Therapy Session",
  "description": "A 60-minute therapy session.",
  "duration": 60,
  "price": 100
  // Matches your Service database schema
}
```

**2. Update Service**
- **Route:** `PATCH /services/:id`
- **Body:**
```json
{
  "price": 120
  // Any fields to update
}
```

*(Note: GET and DELETE routes were omitted as they do not require a `req.body`)*
