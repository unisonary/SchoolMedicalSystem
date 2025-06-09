
# 🏫 School Medical Management System

This is a **full-stack web application** for managing school medical data, built with:

- 🔧 **ASP.NET Core Web API** for backend services  
- 🎨 **ReactJS** for frontend UI  
- 🔐 JWT-based authentication & role management  

> 👤 Roles: `Student`, `Parent`, `Nurse`, `Manager`, `Admin`

---

## 📂 Project Structure

```
SchoolMedicalSystem/
├── MedicalManagement/         # Backend project (ASP.NET Core)
├── frontend/                  # Frontend project (ReactJS)
├── MedicalManagement.sln      # Visual Studio solution file
└── README.md                  # You're reading it!
```

---

## 🚀 Getting Started

### 📦 Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (for frontend)
- SQL Server (LocalDB or remote)

### 🔧 Backend Setup

```bash
cd MedicalManagement
dotnet restore
dotnet ef database update   # Apply migrations
dotnet run
```

API will run at: `https://localhost:7170`

### 💻 Frontend Setup

```bash
cd frontend
npm install
npm start
```

UI runs at: `http://localhost:3000`

---

## ✨ Features

### ✅ Completed
- [x] User login with JWT & password hashing (BCrypt)
- [x] Forgot/reset password with OTP via Gmail SMTP
- [x] Role-based access (Authorize attributes)
- [x] Student: view profile, health records, medical events, vaccinations, checkups, notifications
- [x] Admin: Create other users (via SQL for now)

### 🔧 In Progress
- [ ] Parent consent management
- [ ] Medication tracking
- [ ] Manager health plan workflows
- [ ] Upload student list via Excel (optional)

---

## 🔐 Authentication Example

Use Swagger UI → `Authorize` → enter token:  
```
Bearer <your-JWT-token>
```

---

## 🤝 Contributors

- Cường (Backend ASP.NET Core)
- [Friend's name] (Frontend ReactJS)

---

## 📬 Contact

📧 Email: `cuongndse181836@fpt.edu.vn`  
🏫 University: FPT, PRN212 Project

---

> 📌 This is an academic project for learning purposes. Contributions are welcome!
