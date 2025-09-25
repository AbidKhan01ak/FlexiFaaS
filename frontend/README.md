# FlexiFaaS Frontend

The frontend is a **ReactJS application** that provides a user-friendly interface for interacting with FlexiFaaS.

---

## ✨ Features

- User registration & login
- Upload functions (via file or text)
- Execute functions with input parameters
- View logs, status, and results
- Admin dashboard for managing users, functions, logs

---

## 🖥️ UI Screens

![Frontend UI](../docs/images/frontend-ui.png)

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

![Frontend Workflow](../docs/images/frontend-workflow.png)

1. User logs in → JWT stored in local/session storage
2. Uploads function → API call to middleware
3. Middleware secures & forwards to backend
4. Execution logs displayed on dashboard

---
