# Kirdar AI API Standards

This document outlines the API standards and structure for the Kirdar AI application to ensure consistency across the codebase.

## API Structure

### Base URL

The base URL for all API endpoints is:

```
http://localhost:5001/api
```

In production, this will be replaced with the appropriate domain.

### Authentication

Most endpoints require authentication using JWT tokens. The token should be included in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },  // The response data (varies by endpoint)
  "message": "..."  // Optional success message
}
```

For error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information" // Only in development
}
```

## API Endpoints

### Authentication

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/auth/register` | POST | Register a new user | No |
| `/api/auth/login` | POST | Login a user | No |
| `/api/auth/me` | GET | Get current user profile | Yes |

### User Management

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/user/profile` | GET | Get user profile | Yes |
| `/api/user/profile` | PUT | Update user profile | Yes |
| `/api/user/questionnaire` | POST | Submit user questionnaire | Yes |
| `/api/user/progress` | GET | Get user progress | Yes |
| `/api/user/progress/scenario` | GET | Get user scenario progress | Yes |

### Personas

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/personas` | GET | Get all personas | Yes |
| `/api/personas/:id` | GET | Get persona by ID | Yes |
| `/api/personas` | POST | Create a new persona | Yes |
| `/api/personas/:id` | PUT | Update a persona | Yes |
| `/api/personas/:id` | DELETE | Delete a persona | Yes |
| `/api/personas/generate` | POST | Generate personas | Yes |
| `/api/personas/bulk` | POST | Create multiple personas | Yes |
| `/api/personas/reset` | POST | Reset personas database | Yes (Admin) |

### Scenarios

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/scenarios` | GET | Get all scenarios | Yes |
| `/api/scenarios/:id` | GET | Get scenario by ID | Yes |
| `/api/scenarios` | POST | Create a new scenario | Yes |
| `/api/scenarios/:id` | PUT | Update a scenario | Yes |
| `/api/scenarios/:id` | DELETE | Delete a scenario | Yes |

### Chat

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/chat` | POST | Send a chat message | Yes |
| `/api/chat/evaluate` | POST | Evaluate a chat conversation | Yes |
| `/api/chat/mentor` | POST | Get mentor suggestions | Yes |
| `/api/chat/health` | GET | Check chat service health | No |

### Admin

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/admin/users` | GET | Get all users | Yes (Admin) |
| `/api/admin/stats` | GET | Get system statistics | Yes (Admin) |
| `/api/admin/guest` | POST | Create guest access | Yes (Admin) |

## Frontend API Service

The frontend uses a centralized API service (`apiService.js`) for all API calls. This service:

1. Handles authentication token management
2. Provides consistent error handling
3. Uses standardized endpoint paths from the config
4. Formats requests and responses consistently

## Best Practices

1. **Use the ApiService**: Always use the centralized `ApiService` for API calls in the frontend.
2. **Consistent Error Handling**: Follow the error handling pattern in both frontend and backend.
3. **Response Format**: Always include `success` flag in responses.
4. **Authentication**: Use the `authenticatedRequest` method for endpoints requiring authentication.
5. **Documentation**: Update this document when adding new endpoints.

## API Configuration

API endpoints are configured in `src/config/config.js` and should be referenced using the `API_ENDPOINTS` constants rather than hardcoding URLs in services or components. 