# My Discord App - Backend API

A large-scale Node.js backend project built with TypeScript, Express, and MongoDB, following MVC architecture principles.

## 🏗️ Architecture

This project follows the **MVC (Model-View-Controller)** architecture pattern with clear separation of concerns:

- **Models**: Mongoose schemas and database models
- **Services**: Business logic layer
- **Controllers**: Request/response handling
- **Routes**: API route definitions
- **Middleware**: Custom middleware functions
- **Utils**: Utility functions and helpers
- **Config**: Configuration files

## 📁 Project Structure

```
api/
├── src/
│   ├── config/          # Configuration files (database, app config)
│   ├── controllers/     # Request handlers (business logic orchestration)
│   ├── services/        # Business logic layer
│   ├── models/          # Mongoose models and schemas
│   ├── routes/          # API route definitions
│   ├── middleware/      # Custom middleware (error handling, auth, etc.)
│   ├── utils/           # Utility functions and helpers
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── dist/                # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or remote instance)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up MongoDB:

   **Option A: Local MongoDB**
   - Install MongoDB locally ([Download MongoDB](https://www.mongodb.com/try/download/community))
   - Start MongoDB service:
     ```bash
     # macOS (using Homebrew)
     brew services start mongodb-community
     
     # Linux
     sudo systemctl start mongod
     
     # Windows
     net start MongoDB
     ```

   **Option B: MongoDB Atlas (Cloud)**
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster and get your connection string
   - Use the connection string in your `.env` file

3. Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/my-discord-app
```
   > **Note**: If using MongoDB Atlas, replace the `MONGODB_URI` with your Atlas connection string.

4. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

### Build for Production

```bash
npm run build
npm start
```

## 📝 API Response Structure

All API endpoints follow a standard response structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "statusCode": 200
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error description",
  "statusCode": 400
}
```

## 🔧 Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 📦 Key Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **typescript**: Type safety
- **class-validator**: Validation decorators
- **helmet**: Security middleware
- **cors**: Cross-origin resource sharing
- **morgan**: HTTP request logger
- **compression**: Response compression

## 🏛️ Architecture Principles

1. **Separation of Concerns**: Each layer has a clear responsibility
2. **Type Safety**: Full TypeScript support with strict mode
3. **Scalability**: Easy to add new features without breaking existing code
4. **Consistency**: Standard API response structure across all endpoints
5. **Database Abstraction**: Mongoose models isolate database operations

## 📚 Next Steps

1. Create models in `src/models/`
2. Implement services in `src/services/`
3. Create controllers in `src/controllers/`
4. Define routes in `src/routes/`
5. Add authentication middleware if needed
6. Implement validation using class-validator

## 🔒 Environment Variables

Create a `.env` file with the following variables:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `MONGODB_URI`: MongoDB connection string

