# MERN Stack Intern Evaluation Project

This project implements a full-stack MERN application with the following features:
- Task Management (CRUD)
- User Authentication
- File Upload & Gallery
- Product Search & Filter
- AI Text Summarization

## Setup Instructions

### Prerequisites
- Node.js (v22.12.0 or higher)
- MongoDB running locally or a MongoDB Atlas connection string
- OpenAI API key (for AI feature)

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file with the following variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern-intern-eval
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Auth Routes
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user

### Task Routes
- GET /api/tasks - Get all tasks
- POST /api/tasks - Create new task
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task

### Product Routes
- GET /api/products - Get products (with search/filter)
- POST /api/products - Create product
- PUT /api/products/:id - Update product
- DELETE /api/products/:id - Delete product

## Features

### Task Management
- Create, read, update, and delete tasks
- Task status tracking
- List view with filters

### Authentication
- User registration and login
- JWT-based auth
- Protected routes

### File Upload
- Image upload support
- Gallery view
- File size and type validation

### Product Management
- Search by name
- Filter by category
- Price range filtering
- Responsive grid layout

### AI Integration (Optional)
- Text summarization
- Error handling
- Loading states