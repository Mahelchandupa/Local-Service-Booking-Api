# Architecture Guide

This document explains the architecture patterns and best practices used in this project.

## 📐 MVC Architecture

### Model Layer (`src/models/`)
- **Purpose**: Define Mongoose schemas and database models
- **Responsibility**: Database structure and data validation at the schema level
- **Example Structure**:
  ```typescript
  // src/models/User.ts
  import { Schema, model } from 'mongoose';
  import { IBaseModel, baseSchemaOptions } from './BaseModel';

  export interface IUser extends IBaseModel {
    email: string;
    name: string;
  }

  const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
  }, baseSchemaOptions);

  export const User = model<IUser>('User', userSchema);
  ```

### Service Layer (`src/services/`)
- **Purpose**: Contains business logic and data manipulation
- **Responsibility**: 
  - Database operations (CRUD)
  - Business rules and validations
  - Data transformations
- **Example Structure**:
  ```typescript
  // src/services/userService.ts
  import { User, IUser } from '../models/User';

  export class UserService {
    async createUser(data: Partial<IUser>): Promise<IUser> {
      // Business logic here
      const user = new User(data);
      return await user.save();
    }

    async getUserById(id: string): Promise<IUser | null> {
      return await User.findById(id);
    }
  }
  ```

### Controller Layer (`src/controllers/`)
- **Purpose**: Handle HTTP requests and responses
- **Responsibility**:
  - Extract data from requests
  - Call appropriate services
  - Format and send responses
  - Handle errors
- **Example Structure**:
  ```typescript
  // src/controllers/userController.ts
  import { Request, Response } from 'express';
  import { UserService } from '../services/userService';
  import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';
  import { asyncHandler } from '../middleware/errorHandler';

  class UserController {
    private userService = new UserService();

    createUser = asyncHandler(async (req: Request, res: Response) => {
      const user = await this.userService.createUser(req.body);
      sendSuccessResponse(res, 'User created successfully', user, 201);
    });

    getUserById = asyncHandler(async (req: Request, res: Response) => {
      const user = await this.userService.getUserById(req.params.id);
      if (!user) {
        return sendErrorResponse(res, 'User not found', 404);
      }
      sendSuccessResponse(res, 'User retrieved successfully', user);
    });
  }

  export default new UserController();
  ```

### Route Layer (`src/routes/`)
- **Purpose**: Define API endpoints and connect them to controllers
- **Responsibility**:
  - Route definitions
  - HTTP method mapping
  - Middleware application (validation, auth, etc.)
- **Example Structure**:
  ```typescript
  // src/routes/userRoutes.ts
  import { Router } from 'express';
  import userController from '../controllers/userController';

  const router = Router();

  router.post('/', userController.createUser);
  router.get('/:id', userController.getUserById);

  export default router;
  ```

## 🔄 Request Flow

```
Request → Route → Middleware → Controller → Service → Model → Database
                                           ↓
Response ← Route ← Controller ← Service ← Model ← Database
```

## 📁 File Organization Patterns

### Naming Conventions
- **Models**: PascalCase, singular (e.g., `User.ts`, `Product.ts`)
- **Services**: camelCase with "Service" suffix (e.g., `userService.ts`)
- **Controllers**: camelCase with "Controller" suffix (e.g., `userController.ts`)
- **Routes**: camelCase with "Routes" suffix (e.g., `userRoutes.ts`)
- **Types/Interfaces**: PascalCase with "I" prefix (e.g., `IUser`, `IProduct`)

### File Structure Example
```
src/
├── models/
│   ├── User.ts           # User model
│   └── BaseModel.ts      # Base model utilities
├── services/
│   └── userService.ts    # User business logic
├── controllers/
│   └── userController.ts # User request handlers
├── routes/
│   └── userRoutes.ts     # User API routes
└── types/
    └── index.ts          # Shared TypeScript types
```

## 🛡️ Error Handling

### AppError Class
Use the `AppError` class for known application errors:
```typescript
import { AppError } from '../middleware/errorHandler';

throw new AppError('User not found', 404);
```

### Async Handler
Always wrap async controller methods with `asyncHandler`:
```typescript
import { asyncHandler } from '../middleware/errorHandler';

getUser = asyncHandler(async (req: Request, res: Response) => {
  // Your async code here
});
```

## 📤 Response Formatting

Always use the standard response helpers:

```typescript
import { sendSuccessResponse, sendErrorResponse } from '../utils/apiResponse';

// Success
sendSuccessResponse(res, 'Operation successful', data, 200);

// Error
sendErrorResponse(res, 'Error message', 400);
```

## 🔐 Middleware

### Custom Middleware
Place custom middleware in `src/middleware/`:
- Error handling (already implemented)
- Authentication (to be implemented)
- Validation (to be implemented)
- Rate limiting (to be implemented)

### Using Middleware
```typescript
// In routes
import { authenticate } from '../middleware/auth';

router.get('/protected', authenticate, controller.getProtectedData);
```

## 🔧 Configuration

All configuration is centralized in `src/config/`:
- `database.ts`: MongoDB connection
- `index.ts`: Environment variables and app config

## 📊 Best Practices

1. **Keep controllers thin**: Controllers should only handle HTTP concerns
2. **Keep services focused**: Each service should handle one domain
3. **Validate at multiple layers**: Schema validation + service validation
4. **Use TypeScript types**: Define interfaces for all data structures
5. **Handle errors gracefully**: Use AppError and error middleware
6. **Keep routes clean**: Only route definitions, no business logic
7. **Reuse utilities**: Common functions go in `src/utils/`

