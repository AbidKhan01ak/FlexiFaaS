# FlexiFaaS Frontend

![React](https://img.shields.io/badge/React-18-blue)
![Axios](https://img.shields.io/badge/Axios-HTTP%20Client-green)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-purple)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)

The frontend is a **ReactJS application** that provides a user-friendly interface for interacting with FlexiFaaS.

---

## 📑 Table of Contents

- [Features](#-features)
- [UI Screens](#-ui-screens)
- [Project Structure](#-structure)
- [Tech Stack](#-tech-stack)
- [Workflow](#-workflow)

---

## ✨ Features

- User registration & login
- Upload functions (via file or text)
- Execute functions with input parameters
- View logs, status, and results
- Admin dashboard for managing users, functions, logs

---

## 🖥️ UI

- Login / Signup
- Dashboard
- Upload Function Page
- Execution Logs Page
- Admin Console

---

## 📂 Structure

```
| - /src
| - /components
| - /pages
| - /context
| - /services (Axios API clients)
| - /styles

```

---

## ⚙️ Tech

- ReactJS (with Hooks)
- Axios for API calls
- Bootstrap for styling
- JWT-based auth with `AuthContext`
- Secure communication with middleware

---

## 🔄 Workflow

1. User logs in → JWT stored in local/session storage
2. Uploads function → API call to middleware
3. Middleware secures & forwards to backend
4. Execution logs displayed on dashboard

---
