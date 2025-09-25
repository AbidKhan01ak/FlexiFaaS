# FlexiFaaS Middleware Service

The middleware is a standalone Spring Boot service that ensures **security and preprocessing** of execution requests before they reach the backend.

---

## 🔐 Responsibilities

- JWT-based authentication
- Role-based authorization
- AES encryption/decryption of uploaded functions
- Malware scanning of uploaded code
- Acts as a **gateway** between frontend and backend

---

## 🔄 Workflows

- JWT workflow
  ![Middleware JWT Workflow](../docs/middleware-jwt-auth-sequence.png)
- Encrption/Decryption  
  ![Middleware Encryption/Decryption Workflow](../docs/middleware-encry-decrypt-sequence.png)
- Malware Scan
  ![Middleware Malware scan Workflow](../docs/middleware-malwarescan-sequence.png)

1. User request hits middleware
2. JWT validated → Role checked
3. File is scanned for malware
4. File is encrypted and stored securely
5. Request forwarded to backend for execution

---

## 🏗️ Middleware Class Diagram

![Middleware Class Diagram](../docs/middlware-class-diagram.png)

- Runs as Spring Boot app on **port 8081**
- Intercepts all API requests
- Issues & validates JWT tokens
- Passes secure requests to backend

---

## 📂 Structure

```
| - /controller
| - /service
| - /repository
| - /security
| - /dto
| - /config

```

---

## ⚙️ Tech

- Java 17
- Spring Boot Security
- JWT (stateless sessioning)
- AES Encryption Utilities
- Malware Scan Simulation

---
