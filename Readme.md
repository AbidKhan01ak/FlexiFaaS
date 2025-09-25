# FlexiFaaS – Serverless Function Deployment Engine

FlexiFaaS is a secure, scalable, and modular Function-as-a-Service (FaaS) platform that allows users to upload, execute, and manage functions in multiple programming languages (Java, Python, JavaScript) without managing backend infrastructure.

The project is built as part of **M.Tech Final Year Dissertation** at **BITS Pilani**.

---

## 🚀 Features

- Multi-language function execution (Java, Python, JavaScript)
- Asynchronous, event-driven execution using RabbitMQ
- JWT-based authentication & role-based authorization
- AES-based file encryption & malware scanning
- Interactive ReactJS-based frontend
- Modular architecture with independent backend, middleware, and frontend services

---

## 🏗️ Architecture

![System Architecture](./docs/system-architecture.png)

- **Frontend** → ReactJS client
- **Middleware** → Authentication, authorization, encryption, malware scan
- **Backend** → Spring Boot APIs + Function Execution Engine
- **RabbitMQ** → Message broker for async execution
- **MySQL** → Persistent storage of metadata & logs

---

## 🔄 Workflow

![Workflow](./docs/workflow.png)

1. User registers & logs in
2. Uploads a function (file/code)
3. Middleware validates & secures the request
4. Function is queued in RabbitMQ
5. Worker executes function in requested runtime
6. Logs & results are stored in database
7. User views results via frontend

---

## 📸 Screenshots

(Add actual screenshots in `docs/screenshots/` folder)

![](./docs/screenshots/splashscreen.png)

- Login & Registration
  ![](./docs/screenshots/registration.png)

  ![](./docs/screenshots/login.2png.png)

  ![](./docs/screenshots/dashboard.png)

- User Profile
  ![](./docs/screenshots/userprofile.png)

- Function Upload Page
  ![](./docs/screenshots/functionUpload.png)
  ![](./docs/screenshots/functionUpload2.png)

- Execution History & Logs
  ![](./docs/screenshots/FunctionExecution.png)
  ![](./docs/screenshots/FunctionHistory.png)
  ![](./docs/screenshots/ExecutionLogs.png)

- Function Active or Dead
  ![](./docs/screenshots/ActiveOrDead.png)

- Admin Dashboard
  ![](./docs/screenshots/AdminDashboard.png)
  ![](./docs/screenshots/AdminFunctionOverview.png)

---

## ⚙️ Tech Stack

- **Backend:** Java 17, Spring Boot, Hibernate/JPA
- **Middleware:** Spring Boot (JWT, AES, Security)
- **Frontend:** ReactJS, Axios, Bootstrap
- **Database:** MySQL 8
- **Messaging:** RabbitMQ
- **Testing:** Postman, Swagger

---

## 📂 Project Structure

```
| - /backend
| - /middleware
| - /frontend
| - /docs
```

---

## 🧪 Testing

- API Testing via Postman
- Unit & Integration tests in Spring Boot
- Functional testing of workflows

---

## 📌 Future Enhancements

- Support for more languages (Go, Ruby, PHP, C#)
- Containerized & sandboxed execution
- Cloud deployment (AWS, Azure, GCP)
- Real-time monitoring & analytics

---
