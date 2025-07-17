# Employee Promotions API Documentation

## Overview

The Employee Promotions API provides CRUD operations for managing employee
promotion records. All endpoints return JSON responses and include proper error
handling.

## Base URL

```
http://localhost:3000/api/promotions
```

## Endpoints

### 1. GET /api/promotions

Fetch all employee promotions with pagination and search capabilities.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of records per page (default: 20)
- `search` (optional): Search term for positions or employee names
- `empId` (optional): Filter by specific employee ID

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/promotions?page=1&limit=10&search=manager"
```

**Example Response:**

```json
{
  "promotions": [
    {
      "id": "clx1234567890",
      "empId": "EMP001",
      "salary": 75000.0,
      "revisionDate": "2024-01-15T00:00:00.000Z",
      "currentPosition": "Senior Manager",
      "previousPosition": "Manager",
      "createdAt": "2024-01-10T10:30:00.000Z",
      "updatedAt": "2024-01-10T10:30:00.000Z",
      "employee": {
        "empId": "EMP001",
        "firstName": "John",
        "lastName": "Doe",
        "officeEmail": "john.doe@company.com",
        "currentDesignation": "Senior Manager"
      }
    }
  ],
  "totalCount": 1
}
```

### 2. POST /api/promotions

Create a new employee promotion record.

**Request Body:**

```json
{
  "empId": "EMP001",
  "salary": 75000.0,
  "revisionDate": "2024-01-15",
  "currentPosition": "Senior Manager",
  "previousPosition": "Manager"
}
```

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/promotions" \
  -H "Content-Type: application/json" \
  -d '{
    "empId": "EMP001",
    "salary": 75000.00,
    "revisionDate": "2024-01-15",
    "currentPosition": "Senior Manager",
    "previousPosition": "Manager"
  }'
```

**Example Response (201 Created):**

```json
{
  "id": "clx1234567890",
  "empId": "EMP001",
  "salary": 75000.0,
  "revisionDate": "2024-01-15T00:00:00.000Z",
  "currentPosition": "Senior Manager",
  "previousPosition": "Manager",
  "createdAt": "2024-01-10T10:30:00.000Z",
  "updatedAt": "2024-01-10T10:30:00.000Z",
  "employee": {
    "empId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "officeEmail": "john.doe@company.com",
    "currentDesignation": "Senior Manager"
  }
}
```

### 3. GET /api/promotions/[id]

Fetch a specific promotion record by ID.

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/promotions/clx1234567890"
```

**Example Response:**

```json
{
  "id": "clx1234567890",
  "empId": "EMP001",
  "salary": 75000.0,
  "revisionDate": "2024-01-15T00:00:00.000Z",
  "currentPosition": "Senior Manager",
  "previousPosition": "Manager",
  "createdAt": "2024-01-10T10:30:00.000Z",
  "updatedAt": "2024-01-10T10:30:00.000Z",
  "employee": {
    "empId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "officeEmail": "john.doe@company.com",
    "currentDesignation": "Senior Manager"
  }
}
```

### 4. PUT /api/promotions/[id]

Update an existing promotion record.

**Request Body:**

```json
{
  "empId": "EMP001",
  "salary": 80000.0,
  "revisionDate": "2024-01-15",
  "currentPosition": "Senior Manager",
  "previousPosition": "Manager"
}
```

**Example Request:**

```bash
curl -X PUT "http://localhost:3000/api/promotions/clx1234567890" \
  -H "Content-Type: application/json" \
  -d '{
    "empId": "EMP001",
    "salary": 80000.00,
    "revisionDate": "2024-01-15",
    "currentPosition": "Senior Manager",
    "previousPosition": "Manager"
  }'
```

### 5. DELETE /api/promotions/[id]

Delete a promotion record.

**Example Request:**

```bash
curl -X DELETE "http://localhost:3000/api/promotions/clx1234567890"
```

**Example Response:**

```json
{
  "message": "Promotion deleted successfully"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "All required fields must be provided"
}
```

### 404 Not Found

```json
{
  "error": "Promotion not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to fetch promotions"
}
```

## Field Validations

- **empId**: Required, must exist in Employee table
- **salary**: Required, must be a positive number
- **revisionDate**: Required, valid date format
- **currentPosition**: Required, string
- **previousPosition**: Required, string

## Database Schema

```sql
CREATE TABLE "EmployeePromotion" (
    "id" TEXT NOT NULL,
    "empId" TEXT NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "revisionDate" DATE NOT NULL,
    "currentPosition" TEXT NOT NULL,
    "previousPosition" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeePromotion_pkey" PRIMARY KEY ("id")
);

-- Foreign key constraint
ALTER TABLE "EmployeePromotion" ADD CONSTRAINT "EmployeePromotion_empId_fkey"
FOREIGN KEY ("empId") REFERENCES "Employee"("empId") ON DELETE RESTRICT ON UPDATE CASCADE;
```

## Testing with JavaScript/TypeScript

```typescript
// Example service class for frontend integration
class PromotionService {
  private baseUrl = '/api/promotions';

  async getPromotions(page = 1, limit = 20, search = '', empId = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(empId && { empId }),
    });

    const response = await fetch(`${this.baseUrl}?${params}`);
    return response.json();
  }

  async createPromotion(promotionData: {
    empId: string;
    salary: number;
    revisionDate: string;
    currentPosition: string;
    previousPosition: string;
  }) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promotionData),
    });
    return response.json();
  }

  async updatePromotion(id: string, promotionData: any) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promotionData),
    });
    return response.json();
  }

  async deletePromotion(id: string) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }
}
```
