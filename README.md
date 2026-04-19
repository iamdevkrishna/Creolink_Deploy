# Creolink

Creolink is a modern full-stack web application designed for freelancers and creative professionals to manage clients, track project progress, and facilitate communication through customized client portals.

## Features

- **Freelancer Dashboard**: Manage clients, upload avatars, and create specific projects.
- **Client Portals**: Generates dedicated magic links allowing clients to access their tailored web portal without complex logins.
- **Messaging system**: Real-time communication between freelancers and clients.
- **File Sharing**: Centralized hub to share design iterations, documents, and project deliverables with clients.

## Tech Stack

- **Backend**: Django & Django REST Framework (Python), PostgreSQL
- **Frontend**: React + Vite + TailwindCSS
- **Authentication**: JWT authentication with digital Keycards.

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL

### Setup & Installation

1. **Clone the repository!**
   ```bash
   git clone https://github.com/your-username/Creolink.git
   cd Creolink
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   # Activate your virtual environment (. venv/bin/activate or venv\Scripts\activate)
   pip install -r requirements.txt
   
   # Setup your environment variables by creating backend/.env (refer to .env.example if available)
   # Run migrations
   python manage.py migrate
   
   # Start the server
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Setup your environment variables by creating frontend/.env
   # Start Vite server
   npm run dev
   ```

## Environment Variables

Make sure to set up `.env` files locally before running the application.

**Backend** (`backend/.env`):
```env
SECRET_KEY='your-secret-key-here'
DB_NAME='creolink_db'
DB_USER='postgres'
DB_PASSWORD='your-password'
DB_HOST='localhost'
DB_PORT='5432'
DEBUG=True
```

**Frontend** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_FRONTEND_URL=http://localhost:5173
```
