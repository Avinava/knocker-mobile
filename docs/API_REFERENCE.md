# Knocker API Reference

**Base URL:** `https://knocker-prod-d9d209c5c2c9.herokuapp.com/api/v1`

**Last Updated:** December 9, 2025

## ✅ API Verification

**Status:** All endpoints verified and functioning correctly  
**Last Tested:** December 9, 2025  
**Test Environment:** Production (Heroku)  
**Test User:** Admin role (amdevelopera@gmail.com)

**Tested Endpoints:**
- ✅ Authentication (login, session, logout)
- ✅ Health check (public endpoint)
- ✅ Configuration (FlexiPage config)
- ✅ Properties (paginated data with relationships)
- ✅ Leads (accessible leads with filters)
- ✅ Dashboard (metrics and trends)
- ✅ Timeline (aggregated record timeline)
- ✅ Workflow (picklist values)
- ✅ Error handling (proper status codes and messages)

All response formats match the documented examples below.

## Table of Contents

1. [Authentication](#authentication)
2. [Health Check](#health-check)
3. [Configuration](#configuration)
4. [Auth Endpoints](#auth-endpoints)
5. [Data Endpoints](#data-endpoints)
   - [Properties](#properties)
   - [Leads](#leads)
   - [Projects](#projects)
   - [FlexiPage](#flexipage)
   - [Chatter](#chatter)
   - [Dashboard](#dashboard)
   - [Enrollment](#enrollment)
   - [Inspection](#inspection)
   - [Files](#files)
   - [Timeline](#timeline)
   - [Workflow](#workflow)
   - [Tracking](#tracking)
   - [Events](#events)
   - [Schema](#schema)
   - [Accessories](#accessories)
   - [Utilities](#utilities)
   - [Artifacts](#artifacts)
   - [Build Contracts](#build-contracts)
   - [Insurance Companies](#insurance-companies)
   - [Generic Object](#generic-object)
   - [ListView](#listview)
   - [CompanyCam](#companycam)
6. [File Explorer](#file-explorer)
7. [Admin Endpoints](#admin-endpoints)

---

## Authentication

All endpoints (except public routes) require session-based authentication. Login using the `/auth/login` endpoint to establish a session.

### Session Requirements
- Session cookie is returned after successful login
- Include session cookie in subsequent requests
- Sessions expire based on `rememberMe` setting (7 days or 1 hour)

---

## Health Check

### Check API Health

```
GET /health
```

**Response:**
```json
{
  "message": "API is healthy"
}
```

---

## Configuration

### Get FlexiPage Configuration

```
GET /config/flexipage
```

**Public endpoint** - Returns runtime configuration for FlexiPage features.

**Response:**
```json
{
  "enabled": true,
  "routes": {
    "projects": {
      "enabled": true,
      "developerName": "Project_Layout"
    },
    "projectDetail": {
      "enabled": true,
      "developerName": "Project_Detail_Layout"
    },
    "leads": {
      "enabled": true,
      "developerName": "Lead_Layout"
    }
    // ... more route configurations
  }
}
```

---

## Auth Endpoints

Base path: `/auth`

### 1. Login

```
POST /auth/login
```

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "yourpassword",
  "rememberMe": false
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "Id": "0053h000006yRZAAA2",
    "username": "user@example.com",
    "name": "John Doe",
    "email": "user@example.com",
    "teamMemberId": "a083h000000PqBaAAK",
    "active": true,
    "profile": {
      "isAdmin": false,
      "isPM": true,
      "roles": ["PM", "Field_Rep"]
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "statusCode": 403
}
```

---

### 2. Register User

```
POST /auth/register
```

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
```

**Request Body:**
```json
{
  "username": "newuser@example.com",
  "password": "securepassword",
  "name": "Jane Smith",
  "teamMemberId": "a083h000000PqBbAAK",
  "active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_id_generated"
  }
}
```

---

### 3. Logout

```
POST /auth/logout
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 4. Get Session

```
GET /auth/session
```

**Response (Authenticated):**
```json
{
  "success": true,
  "message": "Session retrieved",
  "data": {
    "Id": "0053h000006yRZAAA2",
    "username": "user@example.com",
    "name": "John Doe",
    // ... user session data
  }
}
```

**Response (Not Authenticated):**
```json
{
  "success": false,
  "message": "Not authenticated",
  "statusCode": 401
}
```

---

### 5. Get User Context

```
GET /auth/user-context
```

Returns full user context including profile, permissions, and roles for visibility rules.

**Response:**
```json
{
  "success": true,
  "message": "User context retrieved",
  "data": {
    "userId": "0053h000006yRZAAA2",
    "teamMemberId": "a083h000000PqBaAAK",
    "profile": {
      "isAdmin": false,
      "isPM": true,
      "roles": ["PM"]
    },
    "permissions": {
      "canViewAllProjects": true,
      "canEditOwnProjects": true
    }
  }
}
```

---

### 6. Update Location (Ping)

```
POST /auth/ping
```

**Request Body:**
```json
{
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location updated successfully"
}
```

---

### 7. Get App Properties

```
GET /auth/app
```

Returns application configuration and properties.

**Response:**
```json
{
  "version": "1.0.0",
  "features": {
    "flexiPage": true,
    "chatter": true
  }
}
```

---

### 8. Change Password

```
POST /auth/change-password
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newsecurepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 9. Biometric Login

```
POST /auth/biometric-login
```

**Request Body:**
```json
{
  "username": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Biometric login successful",
  "data": {
    // ... user session data
  }
}
```

---

## Data Endpoints

Base path: `/data`

All data endpoints require authentication (session cookie).

---

## Properties

Base path: `/data/properties`

### 1. Get All Properties

```
GET /data/properties
```

**Response:**
```json
[
  {
    "Id": "a0B3h000000TlGbEAK",
    "Name": "123 Main St",
    "Property_Street__c": "123 Main St",
    "Property_City__c": "New York",
    "Property_State__c": "NY",
    "Property_Zip__c": "10001",
    "Latitude__c": 40.7128,
    "Longitude__c": -74.0060,
    "Owner_Occupied__c": true,
    "Roof_Type__c": "Asphalt Shingle"
  }
]
```

---

### 2. Get Properties Within Bounds

```
GET /data/properties/within-bounds?minLat=40.0&maxLat=41.0&minLng=-75.0&maxLng=-73.0
```

**Query Parameters:**
- `minLat` (required): Minimum latitude
- `maxLat` (required): Maximum latitude
- `minLng` (required): Minimum longitude
- `maxLng` (required): Maximum longitude

**Response:**
```json
[
  {
    "Id": "a0B3h000000TlGbEAK",
    "Name": "123 Main St",
    "Latitude__c": 40.7128,
    "Longitude__c": -74.0060
  }
]
```

---

### 3. Stream Properties Within Bounds (SSE)

```
GET /data/properties/stream-within-bounds?minLat=40.0&maxLat=41.0&minLng=-75.0&maxLng=-73.0
```

Server-Sent Events (SSE) endpoint that streams properties as they're retrieved.

**Response Stream:**
```
data: {"Id":"a0B3h000000TlGbEAK","Name":"123 Main St",...}

data: {"Id":"a0B3h000000TlGcEAK","Name":"456 Oak Ave",...}

event: complete
data: {}
```

---

### 4. Search Properties

```
GET /data/properties/search?term=main&offset=0&limit=20
```

**Query Parameters:**
- `term` (required, min 3 chars): Search term
- `offset` (optional): Pagination offset
- `limit` (optional): Results per page
- `sortBy` (optional): Field to sort by
- `sortDirection` (optional): ASC or DESC

**Response:**
```json
[
  {
    "Id": "a0B3h000000TlGbEAK",
    "Name": "123 Main St",
    "Property_Street__c": "123 Main St"
  }
]
```

---

### 5. Get Paginated Properties

```
GET /data/properties/paginated?pageSize=20&orderBy=LastModifiedDate&orderDirection=DESC
```

**Query Parameters:**
- `pageSize` (optional, default: 20): Number of records per page
- `orderBy` (optional, default: "LastModifiedDate"): Field to order by
- `orderDirection` (optional, default: "DESC"): ASC or DESC
- `searchTerm` (optional): Search term
- `ownerOccupied` (optional): true/false
- `roofType` (optional): Filter by roof type
- `hasSolar` (optional): true/false
- `phoneFilter` (optional): "all", "hasPhone", "noPhone"
- `cities` (optional): Array of city names
- `postalCodes` (optional): Array of postal codes
- `streets` (optional): Array of street names
- `nextPageToken` (optional): Token for next page

**Response:**
```json
{
  "records": [
    {
      "Id": "a0B3h000000TlGbEAK",
      "Name": "123 Main St",
      "Property_Street__c": "123 Main St",
      "Property_City__c": "New York"
    }
  ],
  "nextPageToken": "eyJsYXN0SWQiOiJhMEIzaDAwMDAwMFRsR2JFQUsifQ==",
  "hasMore": true,
  "totalReturned": 20
}
```

---

### 6. Get Property Metadata

```
GET /data/properties/metadata
```

Returns metadata about property fields (picklist values, field types, etc.).

**Response:**
```json
{
  "fields": {
    "Roof_Type__c": {
      "type": "picklist",
      "label": "Roof Type",
      "values": ["Asphalt Shingle", "Metal", "Tile", "Flat"]
    },
    "Property_State__c": {
      "type": "picklist",
      "label": "State",
      "values": ["NY", "CA", "TX", "FL"]
    }
  }
}
```

---

### 7. Get Property by ID

```
GET /data/properties/:id
```

**Response:**
```json
{
  "Id": "a0B3h000000TlGbEAK",
  "Name": "123 Main St",
  "Property_Street__c": "123 Main St",
  "Property_City__c": "New York",
  "Property_State__c": "NY",
  "Property_Zip__c": "10001",
  "Latitude__c": 40.7128,
  "Longitude__c": -74.0060,
  "Owner_Occupied__c": true,
  "Roof_Type__c": "Asphalt Shingle",
  "Has_Solar_On_Roof__c": false
}
```

---

### 8. Update Property

```
PUT /data/properties/:id
```

**Request Body:**
```json
{
  "Property_Street__c": "124 Main St",
  "Owner_Occupied__c": true,
  "Has_Solar_On_Roof__c": true
}
```

**Response:**
```json
{
  "id": "a0B3h000000TlGbEAK",
  "success": true
}
```

---

### 9. Describe Property Fields

```
GET /data/properties/fields/describe?fields=Has_Solar_On_Roof__c
```

**Query Parameters:**
- `fields` (optional): Array of field names to describe

**Response:**
```json
{
  "fields": [
    {
      "name": "Has_Solar_On_Roof__c",
      "label": "Has Solar On Roof",
      "type": "checkbox",
      "picklistValues": []
    }
  ]
}
```

---

## Leads

Base path: `/data/leads`

### 1. Get Field Descriptions

```
GET /data/leads/fields/describe
```

**Response:**
```json
{
  "fields": [
    {
      "name": "FirstName",
      "label": "First Name",
      "type": "string"
    },
    {
      "name": "Status",
      "label": "Status",
      "type": "picklist",
      "picklistValues": [
        {"label": "New", "value": "New"},
        {"label": "Working", "value": "Working"}
      ]
    }
  ]
}
```

---

### 2. Get Record Types

```
GET /data/leads/record-types
```

**Response:**
```json
[
  {
    "Id": "0123h000000RecordTypeId",
    "Name": "Standard Lead",
    "DeveloperName": "Standard_Lead"
  }
]
```

---

### 3. Create Lead

```
POST /data/leads
```

**Request Body:**
```json
{
  "FirstName": "John",
  "LastName": "Doe",
  "Company": "Acme Corp",
  "Street": "123 Main St",
  "City": "New York",
  "State": "NY",
  "PostalCode": "10001",
  "Phone": "555-0123",
  "Email": "john.doe@example.com",
  "Status": "New",
  "RecordTypeId": "0123h000000RecordTypeId"
}
```

**Response:**
```json
{
  "id": "00Q3h000000LeadId",
  "success": true
}
```

---

### 4. Get Lead Detail

```
GET /data/leads/:id/detail
```

**Response:**
```json
{
  "Id": "00Q3h000000LeadId",
  "FirstName": "John",
  "LastName": "Doe",
  "Company": "Acme Corp",
  "Street": "123 Main St",
  "City": "New York",
  "State": "NY",
  "PostalCode": "10001",
  "Phone": "555-0123",
  "Email": "john.doe@example.com",
  "Status": "New",
  "Owner": {
    "Id": "0053h000006yRZAAA2",
    "Name": "Jane Smith"
  },
  "CreatedDate": "2024-01-15T10:30:00.000Z"
}
```

---

### 5. Update Lead

```
PUT /data/leads/:id
```

**Request Body:**
```json
{
  "Status": "Working",
  "Phone": "555-9999"
}
```

**Response:**
```json
{
  "id": "00Q3h000000LeadId",
  "success": true
}
```

---

### 6. Assign Owner to Lead

```
PATCH /data/leads/:id/assign-owner
```

**Request Body:**
```json
{
  "teamMemberId": "a083h000000PqBaAAK"
}
```

**Response:**
```json
{
  "id": "00Q3h000000LeadId",
  "success": true,
  "message": "Owner assigned successfully"
}
```

---

### 7. Get Utility Bills for Lead

```
GET /data/leads/:leadId/utility-bills
```

**Response:**
```json
[
  {
    "Id": "0693h000000ContentVersionId",
    "Title": "Electric Bill - January 2024",
    "FileExtension": "pdf",
    "ContentSize": 524288,
    "CreatedDate": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### 8. Get Utility Bill Data

```
GET /data/leads/utility-bills/:documentId/data
```

Returns binary stream of the document.

**Response:** Binary file data

---

### 9. Get Submitted Leads

```
GET /data/leads/submitted-by-me?startDate=2024-01-01&endDate=2024-12-31
```

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)

**Response:**
```json
[
  {
    "Id": "00Q3h000000LeadId",
    "FirstName": "John",
    "LastName": "Doe",
    "Status": "New",
    "CreatedDate": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### 10. Get Accessible Leads

```
GET /data/leads/accessible?pageSize=200&orderBy=CreatedDate&orderDirection=DESC
```

Returns leads accessible to the current user based on ownership and permissions.

**Query Parameters:**
- `pageSize` (optional, default: 200, max: 2000): Records per page
- `orderBy` (optional, default: "CreatedDate"): Field to order by
- `orderDirection` (optional, default: "DESC"): ASC or DESC
- `searchTerm` (optional): Search term
- `startDate` (optional): Filter by created date start
- `endDate` (optional): Filter by created date end
- `status` (optional): Filter by status
- `selfGenerated` (optional): true/false - filter by self-generated leads
- `cities` (optional): Array of cities
- `postalCodes` (optional): Array of postal codes
- `nextPageToken` (optional): Token for next page

**Response:**
```json
{
  "leads": [
    {
      "Id": "00Q3h000000LeadId",
      "FirstName": "John",
      "LastName": "Doe",
      "Status": "New",
      "attributes": {
        "isSelfGenerated": true
      }
    }
  ],
  "nextPageToken": "eyJsYXN0SWQiOiIwMFEzaDAwMDAwMExlYWRJZCJ9",
  "hasMore": true,
  "totalReturned": 200
}
```

---

### 11. Get Upcoming Appointments

```
GET /data/leads/upcoming-appointments?startDate=2024-12-09T00:00:00Z&endDate=2024-12-16T23:59:59Z
```

**Query Parameters:**
- `startDate` (optional): ISO date format
- `endDate` (optional): ISO date format

**Response:**
```json
[
  {
    "Id": "00U3h000000AppointmentId",
    "Subject": "Site Visit - 123 Main St",
    "ActivityDate": "2024-12-10",
    "ActivityDateTime": "2024-12-10T14:00:00.000Z",
    "Lead": {
      "Id": "00Q3h000000LeadId",
      "Name": "John Doe",
      "Street": "123 Main St"
    }
  }
]
```

---

## Projects

Base path: `/data/projects`

**Note:** All project endpoints require PM or Admin role.

### 1. Get Projects

```
GET /data/projects?pageSize=200&orderBy=Name&orderDirection=ASC
```

**Query Parameters:**
- `pageSize` (optional, default: 200, max: 200): Records per page
- `orderBy` (optional, default: "Name"): Field to order by
- `orderDirection` (optional, default: "ASC"): ASC or DESC
- `searchTerm` (optional): Search term
- `stage` (optional): Filter by project stage
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)
- `excludeClosed` (optional, default: "true"): Exclude closed projects
- `nextPageToken` (optional): Token for next page

**Response:**
```json
{
  "records": [
    {
      "Id": "a013h000000ProjectId",
      "Name": "Downtown Renovation",
      "Project_Type__c": "Commercial",
      "Project_Stage__c": "In Progress",
      "Start_Date__c": "2024-01-15",
      "Client__c": "Acme Corp",
      "Project_Street__c": "123 Main St",
      "Project_City__c": "New York",
      "Project_State__c": "NY"
    }
  ],
  "nextPageToken": "eyJsYXN0SWQiOiJhMDEzaDAwMDAwMFByb2plY3RJZCJ9",
  "hasMore": true
}
```

---

### 2. Get Project by ID

```
GET /data/projects/:id
```

**Response:**
```json
{
  "Id": "a013h000000ProjectId",
  "Name": "Downtown Renovation",
  "Project_Type__c": "Commercial",
  "Project_Stage__c": "In Progress",
  "Start_Date__c": "2024-01-15",
  "Client__c": "Acme Corp",
  "Owner": {
    "Id": "0053h000006yRZAAA2",
    "Name": "Jane Smith"
  },
  "Project_Team__r": {
    "records": [
      {
        "Id": "a083h000000TeamMemberId",
        "Team_Member__r": {
          "Name": "John Doe"
        },
        "Role__c": "Project Manager"
      }
    ]
  }
}
```

---

### 3. Create Project

```
POST /data/projects
```

**Request Body:**
```json
{
  "Name": "New Construction Project",
  "Project_Type__c": "Residential",
  "Client__c": "ABC Company",
  "Project_Stage__c": "Planning",
  "Start_Date__c": "2024-02-01",
  "Project_Street__c": "456 Oak Ave",
  "Project_City__c": "Los Angeles",
  "Project_State__c": "CA",
  "Project_ZIP_Cde__c": "90001",
  "OwnerId": "0053h000006yRZAAA2"
}
```

**Response:**
```json
{
  "id": "a013h000000NewProjectId",
  "success": true
}
```

---

### 4. Update Project

```
PUT /data/projects/:id
```

**Request Body:**
```json
{
  "Project_Stage__c": "In Progress",
  "Start_Date__c": "2024-02-15"
}
```

**Response:**
```json
{
  "id": "a013h000000ProjectId",
  "success": true
}
```

---

## FlexiPage

Base path: `/data/flexipage`

FlexiPage endpoints provide dynamic page rendering based on Salesforce Lightning FlexiPage metadata.

### 1. Get Record

```
GET /data/flexipage/record/:objectName/:recordId?fields=Name,Status__c&flexiPageName=Project_Detail
```

**Path Parameters:**
- `objectName`: Salesforce object API name (e.g., "Project__c", "Lead")
- `recordId`: Salesforce record ID (15 or 18 chars)

**Query Parameters:**
- `fields` (optional): Array of field API names to retrieve
- `flexiPageName` (optional): FlexiPage developer name for optimized queries

**Response:**
```json
{
  "success": true,
  "data": {
    "record": {
      "Id": "a013h000000ProjectId",
      "Name": "Downtown Renovation",
      "Project_Type__c": "Commercial",
      "Project_Stage__c": "In Progress"
    },
    "relatedLists": {
      "Project_Team__r": {
        "records": [
          {
            "Id": "a083h000000TeamMemberId",
            "Team_Member__r": {
              "Name": "John Doe"
            }
          }
        ]
      }
    }
  },
  "metadata": {
    "objectName": "Project__c",
    "recordId": "a013h000000ProjectId",
    "flexiPageName": "Project_Detail",
    "accessTime": "2024-12-09T10:30:00.000Z",
    "performance": {
      "queryType": "optimized",
      "fieldsCount": 25,
      "relatedListsCount": 3
    }
  }
}
```

---

### 2. Get Related Lists

```
GET /data/flexipage/related-lists/:objectName/:recordId?flexiPageName=Project_Detail
```

**Query Parameters:**
- `flexiPageName` (required): FlexiPage developer name

**Response:**
```json
{
  "success": true,
  "data": {
    "Project_Team__r": {
      "records": [
        {
          "Id": "a083h000000TeamMemberId",
          "Team_Member__r": {
            "Name": "John Doe"
          },
          "Role__c": "Project Manager"
        }
      ]
    },
    "Tasks": {
      "records": [
        {
          "Id": "00T3h000000TaskId",
          "Subject": "Review Plans",
          "Status": "In Progress"
        }
      ]
    }
  },
  "metadata": {
    "objectName": "Project__c",
    "recordId": "a013h000000ProjectId",
    "relatedListsCount": 2
  }
}
```

---

### 3. Get Records (List)

```
GET /data/flexipage/records/:objectName?limit=20&offset=0&searchTerm=downtown
```

**Path Parameters:**
- `objectName`: Salesforce object API name

**Query Parameters:**
- `limit` (optional, max: 100, default: 20): Number of records
- `offset` (optional, default: 0): Pagination offset
- `searchTerm` (optional): Search term
- `fields` (optional): Array of field API names

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "Id": "a013h000000ProjectId",
      "Name": "Downtown Renovation"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  },
  "metadata": {
    "objectName": "Project__c",
    "totalReturned": 20
  }
}
```

---

### 4. Get Object Configuration

```
GET /data/flexipage/config/:objectName
```

**Response:**
```json
{
  "success": true,
  "data": {
    "objectApiName": "Project__c",
    "label": "Project",
    "labelPlural": "Projects",
    "fields": [
      {
        "name": "Name",
        "label": "Project Name",
        "type": "string",
        "required": true
      }
    ],
    "layouts": [
      {
        "name": "Project_Detail",
        "type": "Record Page"
      }
    ]
  }
}
```

---

### 5. Update Record

```
PUT /data/flexipage/record/:objectName/:recordId
```

**Request Body:**
```json
{
  "Name": "Updated Project Name",
  "Project_Stage__c": "Completed"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "a013h000000ProjectId",
    "success": true
  },
  "metadata": {
    "objectName": "Project__c",
    "recordId": "a013h000000ProjectId",
    "updatedFields": ["Name", "Project_Stage__c"],
    "updateTime": "2024-12-09T10:30:00.000Z"
  }
}
```

**Response (Formula Field Error):**
```json
{
  "success": false,
  "error": "Cannot update formula fields",
  "details": "Formula fields cannot be updated",
  "formulaFields": ["Total_Amount__c", "Days_Since_Created__c"],
  "errorType": "FORMULA_FIELD_ERROR",
  "userMessage": "Unable to save: Total_Amount__c, Days_Since_Created__c are calculated fields and cannot be updated directly."
}
```

---

## Chatter

Base path: `/data/chatter`

### 1. Get Topics (Admin Only)

```
GET /data/chatter/topics?pageSize=20&nextPageUrl=<encoded_url>
```

**Query Parameters:**
- `pageSize` (optional, default: 20): Number of topics
- `nextPageUrl` (optional): URL for next page

**Response:**
```json
{
  "topics": [
    {
      "id": "0TO3h000000TopicId",
      "name": "Project Updates",
      "description": "Latest project status updates"
    }
  ],
  "currentPageUrl": "/services/data/v60.0/...",
  "nextPageUrl": "/services/data/v60.0/..."
}
```

---

### 2. Get Topic Feed Items (Admin Only)

```
GET /data/chatter/topics/:topicId/feed?pageSize=20
```

**Response:**
```json
{
  "feedItems": [
    {
      "id": "0D53h000000FeedItemId",
      "body": {
        "text": "Project milestone completed!"
      },
      "actor": {
        "id": "0053h000006yRZAAA2",
        "name": "Jane Smith"
      },
      "createdDate": "2024-12-09T10:30:00.000Z"
    }
  ],
  "currentPageUrl": "/services/data/v60.0/...",
  "nextPageUrl": "/services/data/v60.0/..."
}
```

---

### 3. Get Record Feed Items

```
GET /data/chatter/records/:recordId/feed?pageSize=20
```

Returns feed items for a specific record (filtered for supported objects).

**Response:**
```json
{
  "feedItems": [
    {
      "id": "0D53h000000FeedItemId",
      "body": {
        "text": "#Discussions\n*******************************\nProject update posted",
        "messageSegments": [
          {
            "type": "Text",
            "text": "#Discussions\n*******************************\nProject update posted"
          }
        ]
      },
      "parent": {
        "id": "a013h000000ProjectId",
        "type": "Project__c"
      },
      "actor": {
        "id": "0053h000006yRZAAA2",
        "name": "Jane Smith"
      },
      "comments": {
        "total": 2
      },
      "createdDate": "2024-12-09T10:30:00.000Z"
    }
  ]
}
```

---

### 4. Post Feed Item to Topic (Admin Only)

```
POST /data/chatter/topics/:topicId/feed
```

**Request Body:**
```json
{
  "text": "This is a new post to the topic"
}
```

**Response:**
```json
{
  "id": "0D53h000000NewFeedItemId",
  "success": true
}
```

---

### 5. Post Comment to Feed Item

```
POST /data/chatter/feed-elements/:feedItemId/comments
```

**Request Body (HTML Content):**
```json
{
  "htmlContent": "<p>This is a <strong>bold</strong> comment with @mention</p>"
}
```

**Request Body (Plain Text):**
```json
{
  "text": "This is a plain text comment"
}
```

**Request Body (Message Segments):**
```json
{
  "body": {
    "messageSegments": [
      {
        "type": "Text",
        "text": "Hello "
      },
      {
        "type": "EntityLink",
        "entityId": "0053h000006yRZAAA2"
      },
      {
        "type": "Text",
        "text": " - great work!"
      }
    ]
  }
}
```

**Response:**
```json
{
  "id": "0D73h000000CommentId",
  "success": true,
  "url": "/services/data/v60.0/chatter/comments/0D73h000000CommentId"
}
```

---

### 6. Get Comments for Feed Item

```
GET /data/chatter/feed-elements/:feedItemId/comments?pageSize=10
```

**Response:**
```json
{
  "comments": [
    {
      "id": "0D73h000000CommentId",
      "body": {
        "text": "Great update!",
        "messageSegments": [
          {
            "type": "Text",
            "text": "Great update!"
          }
        ]
      },
      "user": {
        "id": "0053h000006yRZAAA2",
        "name": "John Doe"
      },
      "createdDate": "2024-12-09T10:35:00.000Z"
    }
  ]
}
```

---

### 7. Mark Notifications as Read

```
POST /data/chatter/notifications/mark-read
```

**Request Body:**
```json
{
  "notificationIds": ["a0V3h000000NotifId1", "a0V3h000000NotifId2"]
}
```

**Response:**
```json
{
  "success": true,
  "updated": 2
}
```

---

### 8. Get Unread Notification Count

```
GET /data/chatter/notifications/unread-count
```

**Response:**
```json
{
  "count": 5
}
```

---

### 9. Get Notifications

```
GET /data/chatter/notifications?pageSize=20
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "a0V3h000000NotifId",
      "feedItemId": "0D53h000000FeedItemId",
      "commentId": "0D73h000000CommentId",
      "mentionedUser": "Jane Smith",
      "isRead": false,
      "createdDate": "2024-12-09T10:30:00.000Z"
    }
  ]
}
```

---

## Dashboard

Base path: `/data/dashboard`

### 1. Get Metrics

```
GET /data/dashboard/metrics
```

Returns weekly metrics for events and leads over the last 12 weeks.

**Response:**
```json
{
  "events": {
    "weeks": [
      {
        "weekStart": "2024-11-25",
        "weekEnd": "2024-12-01",
        "count": 45
      }
    ],
    "total": 540
  },
  "leads": {
    "weeks": [
      {
        "weekStart": "2024-11-25",
        "weekEnd": "2024-12-01",
        "count": 12
      }
    ],
    "total": 144
  }
}
```

---

### 2. Get Goals Progress

```
GET /data/dashboard/goals/progress
```

Returns current week and month progress against user goals.

**Response:**
```json
{
  "weekly": {
    "knocks": {
      "current": 35,
      "goal": 100,
      "progress": 35.0
    },
    "leads": {
      "current": 8,
      "goal": 50,
      "progress": 16.0
    },
    "conversion": "22.9"
  },
  "monthly": {
    "knocks": {
      "current": 142,
      "goal": 400,
      "progress": 35.5
    },
    "leads": {
      "current": 31,
      "goal": 200,
      "progress": 15.5
    },
    "conversion": "21.8"
  },
  "goals": {
    "leads": 50,
    "knocks": 100
  }
}
```

---

### 3. Get Historical Goals Progress

```
GET /data/dashboard/goals/progress/history?weeks=12
```

**Query Parameters:**
- `weeks` (optional, default: 12): Number of weeks to retrieve

**Response:**
```json
{
  "progress": [
    {
      "weekStart": "2024-11-25",
      "weekEnd": "2024-12-01",
      "knocks": 45,
      "leads": 12,
      "conversion": 26.7
    }
  ],
  "goals": {
    "weekly": {
      "knocks": 100,
      "leads": 50
    },
    "monthly": {
      "knocks": 400,
      "leads": 200
    }
  }
}
```

---

## Enrollment

Base path: `/data/enrollments`

### 1. Get Field Descriptions

```
GET /data/enrollments/fields/describe
```

**Response:**
```json
{
  "fields": [
    {
      "name": "Scope_of_Loss__c",
      "label": "Scope of Loss",
      "type": "picklist",
      "picklistValues": [
        {"label": "Interior", "value": "Interior"},
        {"label": "Exterior", "value": "Exterior"}
      ]
    }
  ]
}
```

---

### 2. Create Enrollment

```
POST /data/enrollments
```

**Request Body:**
```json
{
  "Project__c": "a013h000000ProjectId",
  "Scope_of_Loss__c": "Exterior",
  "Type_of_Loss__c": "Water Damage",
  "Notes__c": "Initial assessment completed"
}
```

**Response:**
```json
{
  "id": "a023h000000EnrollmentId",
  "success": true
}
```

---

### 3. Update Enrollment

```
PUT /data/enrollments/:id
```

**Request Body:**
```json
{
  "Scope_of_Loss__c": "Interior and Exterior",
  "Status__c": "In Progress"
}
```

**Response:**
```json
{
  "id": "a023h000000EnrollmentId",
  "success": true
}
```

---

### 4. Get Enrollment Detail

```
GET /data/enrollments/:id/detail
```

**Response:**
```json
{
  "Id": "a023h000000EnrollmentId",
  "Scope_of_Loss__c": "Exterior",
  "Type_of_Loss__c": "Water Damage",
  "Status__c": "New",
  "Project__r": {
    "Id": "a013h000000ProjectId",
    "Name": "Downtown Renovation"
  },
  "CreatedDate": "2024-12-09T10:30:00.000Z"
}
```

---

### 5. Get My Enrollments

```
GET /data/enrollments/my-enrollments
```

**Response:**
```json
[
  {
    "Id": "a023h000000EnrollmentId",
    "Scope_of_Loss__c": "Exterior",
    "Status__c": "In Progress",
    "Project__r": {
      "Name": "Downtown Renovation"
    }
  }
]
```

---

### 6. Upload Enrollment Files

```
POST /data/enrollments/files
```

**Content-Type:** `multipart/form-data`

**Form Data:**
- `files`: Array of files (max 10, 5MB each)
- `enrollmentId`: Enrollment record ID
- `type`: File type (e.g., "Contract", "Photo")

**Response:**
```json
{
  "success": true,
  "ids": ["0693h000000FileId1", "0693h000000FileId2"]
}
```

---

## Inspection

Base path: `/data/inspection`

### 1. Create Inspection

```
POST /data/inspection/:property_id
```

**Content-Type:** `multipart/form-data`

**Form Data:**
- `data`: JSON string with inspection artifacts
- `files`: Array of photo files

**Request Data Structure:**
```json
[
  {
    "artifact_id": "a0A3h000000ArtifactId",
    "type": "Roof",
    "section": "Exterior.Roof",
    "subsection": "Main Roof",
    "position": 1,
    "location": "Front",
    "fields": {
      "accessoryName": "Asphalt Shingle Roof"
    },
    "metadata": {
      "fieldApi": "Roof__c"
    },
    "photos": [
      {
        "fileName": "roof_photo_1",
        "type": "Roof_Photo"
      }
    ],
    "damages": [
      {
        "damageTypeId": "a0D3h000000DamageTypeId",
        "damageTypeName": "Missing Shingles",
        "severity": "Medium",
        "photos": [
          {
            "fileName": "damage_photo_1",
            "type": "Damage_Photo"
          }
        ]
      }
    ]
  }
]
```

**Response:**
```json
{
  "success": true,
  "inspection_id": "a033h000000InspectionId",
  "results": [
    {
      "artifact_id": "a0A3h000000ArtifactId",
      "artifact_item_id": "a043h000000ArtifactItemId",
      "type": "Roof",
      "location": "Front",
      "success": true
    }
  ]
}
```

---

### 2. Get Inspections for Property

```
GET /data/inspection/:property_id
```

**Response:**
```json
[
  {
    "Id": "a033h000000InspectionId",
    "Name": "Inspection 2024-12-09",
    "Property__c": "a0B3h000000PropertyId",
    "CreatedDate": "2024-12-09T10:30:00.000Z",
    "Artifact_Items__r": {
      "records": [
        {
          "Id": "a043h000000ArtifactItemId",
          "Type__c": "Roof",
          "Section__c": "Exterior.Roof"
        }
      ]
    }
  }
]
```

---

### 3. Update Inspection

```
PUT /data/inspection/:inspection_id
```

Similar structure to create, but updates existing inspection.

**Response:**
```json
{
  "success": true,
  "inspection_id": "a033h000000InspectionId",
  "updated": 5,
  "created": 2,
  "deleted": 1
}
```

---

### 4. Get Inspection PDF

```
GET /data/inspection/:inspection_id/pdf
```

Generates and returns a PDF report of the inspection.

**Response:** Binary PDF data

---

## Files

Base path: `/data/files`

### 1. Get File Content

```
GET /data/files/:versionId
```

**Response:** Binary file stream with appropriate content-type headers

---

### 2. Upload Files

```
POST /data/files
```

**Content-Type:** `multipart/form-data`

**Form Data:**
- `files`: Array of files (max 10, 5MB each)
- `recordId`: Encrypted record ID to attach files to
- `type`: File type/category
- `titlePrefix`: Optional prefix for file titles (default: "File")

**Response:**
```json
{
  "success": true,
  "ids": ["0693h000000FileId1", "0693h000000FileId2"]
}
```

---

## Timeline

Base path: `/data/timeline`

### 1. Get Timeline Items

```
GET /data/timeline?startDate=2024-12-01&endDate=2024-12-31&limit=50
```

**Query Parameters:**
- `startDate` (optional): Start date for timeline
- `endDate` (optional): End date for timeline
- `includeEvents` (optional, default: "true"): Include events
- `includeLeads` (optional, default: "true"): Include leads
- `includeAppointments` (optional, default: "true"): Include appointments
- `limit` (optional, default: 50): Max items to return
- `userId` (optional, admin only): Get timeline for specific user

**Response:**
```json
[
  {
    "id": "00U3h000000EventId",
    "type": "event",
    "title": "Knocked on door",
    "date": "2024-12-09T14:30:00.000Z",
    "property": {
      "Id": "a0B3h000000PropertyId",
      "Name": "123 Main St"
    }
  },
  {
    "id": "00Q3h000000LeadId",
    "type": "lead",
    "title": "New Lead Created",
    "date": "2024-12-09T15:00:00.000Z",
    "lead": {
      "Id": "00Q3h000000LeadId",
      "Name": "John Doe"
    }
  }
]
```

---

## Workflow

Base path: `/data/workflow`

### 1. Get Workflow Records

```
GET /data/workflow/records/:recordId?workflowIds=wf1,wf2
```

**Query Parameters:**
- `workflowIds` (optional): Comma-separated workflow IDs or array

**Response:**
```json
{
  "success": true,
  "data": {
    "recordId": "a013h000000ProjectId",
    "workflows": [
      {
        "id": "wf1",
        "name": "Project Workflow",
        "currentStage": "In Progress",
        "stages": [
          {
            "name": "Planning",
            "status": "completed",
            "completedDate": "2024-01-15"
          },
          {
            "name": "In Progress",
            "status": "active"
          },
          {
            "name": "Completed",
            "status": "pending"
          }
        ]
      }
    ]
  }
}
```

---

### 2. Update Workflow Record

```
PUT /data/workflow/records/:recordId
```

**Request Body:**
```json
{
  "fieldName": "Project_Stage__c",
  "value": "Completed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "a013h000000ProjectId",
    "success": true
  }
}
```

---

### 3. Invalidate Workflow Cache

```
POST /data/workflow/cache/invalidate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invalidated": true
  }
}
```

---

### 4. Get Picklist Values

```
GET /data/workflow/picklist-values?objectApiName=Project__c&fieldApiName=Project_Stage__c
```

**Query Parameters:**
- `objectApiName` (required): Object API name
- `fieldApiName` (required): Field API name
- `recordTypeId` (optional): Record type ID for record-type-specific values

**Response:**
```json
[
  {
    "label": "Planning",
    "value": "Planning",
    "active": true
  },
  {
    "label": "In Progress",
    "value": "In Progress",
    "active": true
  },
  {
    "label": "Completed",
    "value": "Completed",
    "active": true
  }
]
```

---

### 5. Get Record Values

```
GET /data/workflow/record-values?recordId=a013h000000ProjectId&fields=Name,Project_Stage__c
```

**Query Parameters:**
- `recordId` (required): Salesforce record ID
- `fields` (required): Comma-separated field API names
- `workflowId` (optional): Workflow ID for context

**Response:**
```json
{
  "success": true,
  "data": {
    "Id": "a013h000000ProjectId",
    "Name": "Downtown Renovation",
    "Project_Stage__c": "In Progress"
  }
}
```

---

## Tracking

Base path: `/data/tracking`

**Note:** Admin-only endpoints.

### 1. Get Team Members

```
GET /data/tracking/team-members
```

**Response:**
```json
[
  {
    "Id": "a083h000000TeamMemberId",
    "Name": "John Doe",
    "Active__c": true,
    "User__r": {
      "Id": "0053h000006yRZAAA2",
      "Name": "John Doe"
    }
  }
]
```

---

### 2. Get Location History

```
GET /data/tracking/location-history?teamMemberId=a083h000000TeamMemberId&startDate=2024-12-09T00:00:00Z&endDate=2024-12-09T23:59:59Z
```

**Query Parameters:**
- `teamMemberId` (required): Team member ID
- `startDate` (required): ISO datetime
- `endDate` (required): ISO datetime

**Response:**
```json
[
  {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timestamp": "2024-12-09T10:30:00.000Z",
    "accuracy": 10
  }
]
```

---

### 3. Get Daily Summary

```
GET /data/tracking/daily-summary/:teamMemberId/:date
```

**Path Parameters:**
- `teamMemberId`: Team member ID
- `date`: Date in YYYY-MM-DD format

**Response:**
```json
{
  "date": "2024-12-09",
  "teamMember": {
    "Id": "a083h000000TeamMemberId",
    "Name": "John Doe"
  },
  "summary": {
    "totalKnocks": 45,
    "totalLeads": 8,
    "conversionRate": 17.8,
    "hoursWorked": 8.5,
    "areasVisited": ["Downtown", "Midtown"]
  }
}
```

---

## Additional Data Endpoints

### Events

```
GET /data/events
POST /data/events
PUT /data/events/:id
GET /data/events/:id
```

### Schema

```
GET /data/schema/describe/:objectName
GET /data/schema/picklist/:objectName/:fieldName
```

### Accessories

```
GET /data/accessories
POST /data/accessories
GET /data/accessories/:property_id
GET /data/accessories/clear-cache
```

### Utilities

```
GET /data/utilities
```

### Artifacts

```
GET /data/artifacts
POST /data/artifacts
```

### Build Contracts

```
GET /data/buildcontracts
POST /data/buildcontracts
GET /data/buildcontracts/:id
PUT /data/buildcontracts/:id
```

### Insurance Companies

```
GET /data/insurance-companies
```

### Generic Object

```
GET /data/generic/:objectName
POST /data/generic/:objectName
GET /data/generic/:objectName/:recordId
PUT /data/generic/:objectName/:recordId
```

### ListView

```
GET /data/listview/:objectName
GET /data/listview/:objectName/:listViewId
```

### CompanyCam

```
GET /data/companycam/projects
GET /data/companycam/projects/:projectId/photos
POST /data/companycam/upload
```

---

## File Explorer

Base path: `/file-explorer`

### 1. Check Permission

```
GET /file-explorer/permission
```

**Response:**
```json
{
  "hasPermission": true
}
```

---

### 2. Get File Explorer Items

```
GET /file-explorer/:recordId
```

**Response:**
```json
{
  "folders": [
    {
      "Id": "0153h000000FolderId",
      "Name": "Contracts",
      "Type": "Folder"
    }
  ],
  "files": [
    {
      "Id": "0693h000000FileId",
      "Title": "Project Plan.pdf",
      "FileExtension": "pdf",
      "ContentSize": 524288,
      "CreatedDate": "2024-12-09T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Get File Preview

```
GET /file-explorer/file/:contentDocumentId/preview?type=THUMB720BY480
```

**Query Parameters:**
- `type` (optional, default: "THUMB720BY480"): Preview type (THUMB720BY480, PDF)

**Response:** Binary image/PDF data

---

### 4. Get File Content

```
GET /file-explorer/file/:contentDocumentId/content?versionNumber=1
```

**Query Parameters:**
- `versionNumber` (optional): Specific version number

**Response:** Binary file data with inline disposition

---

### 5. Download File

```
GET /file-explorer/file/:contentDocumentId/download?versionNumber=1
```

**Response:** Binary file data with attachment disposition

---

### 6. Upload Files

```
POST /file-explorer/:recordId/upload
```

**Content-Type:** `multipart/form-data`

**Form Data:**
- `files`: Array of files (max 50MB each)
- `folderId` (optional): Folder ID to upload to

**Response:**
```json
{
  "success": true,
  "uploaded": [
    {
      "id": "0693h000000FileId",
      "title": "Document.pdf",
      "success": true
    }
  ]
}
```

---

### 7. Create Folder

```
POST /file-explorer/:recordId/folder
```

**Request Body:**
```json
{
  "name": "New Folder",
  "parentFolderId": "0153h000000ParentFolderId"
}
```

**Response:**
```json
{
  "success": true,
  "folderId": "0153h000000NewFolderId"
}
```

---

### 8. Delete File

```
DELETE /file-explorer/file/:contentDocumentId
```

**Response:**
```json
{
  "success": true
}
```

---

### 9. Rename File

```
PUT /file-explorer/file/:contentDocumentId/rename
```

**Request Body:**
```json
{
  "title": "New File Name"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### 10. Move File

```
PUT /file-explorer/file/:contentDocumentId/move
```

**Request Body:**
```json
{
  "folderId": "0153h000000TargetFolderId"
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Admin Endpoints

Base path: `/admin`

### Cache Management

```
GET /admin/cache/stats
```

Returns cache statistics.

**Response:**
```json
{
  "hits": 1250,
  "misses": 350,
  "keys": 45,
  "size": "2.5MB"
}
```

---

```
POST /admin/cache/clear
```

Clears all cache entries.

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared successfully"
}
```

---

## Error Responses

All endpoints follow a consistent error response format:

### 400 Bad Request

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Not authenticated",
  "statusCode": 401
}
```

---

### 403 Forbidden

```json
{
  "success": false,
  "error": "Access denied to object",
  "message": "You don't have permission to access this resource"
}
```

---

### 404 Not Found

```json
{
  "success": false,
  "error": "Record not found",
  "message": "The requested resource could not be found"
}
```

---

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error",
  "details": "An unexpected error occurred"
}
```

---

## Rate Limiting

- **Public endpoints** (auth, config): 100 requests per 15 minutes per IP
- **Authenticated endpoints**: 1000 requests per 15 minutes per user
- **Search endpoints**: 20 requests per minute per user
- **File upload endpoints**: 10 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702123456
```

---

## Authentication Example (curl)

```bash
# Login
curl -X POST 'https://knocker-prod-d9d209c5c2c9.herokuapp.com/api/v1/auth/login' \
  -H 'Content-Type: application/json' \
  -c cookies.txt \
  -d '{
    "username": "user@example.com",
    "password": "yourpassword",
    "rememberMe": false
  }'

# Use session cookie for subsequent requests
curl 'https://knocker-prod-d9d209c5c2c9.herokuapp.com/api/v1/data/properties' \
  -H 'Accept: application/json' \
  -b cookies.txt
```

---

## Notes

1. **Session Management**: Sessions are managed via HTTP-only cookies. After login, the session cookie is automatically included in subsequent requests.

2. **Date Formats**: 
   - Query parameters: `YYYY-MM-DD` or ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`)
   - Response dates: ISO 8601 format

3. **Pagination**: Most list endpoints support pagination via `nextPageToken`. Include the token from the response in the next request to get the next page.

4. **FlexiPage**: FlexiPage endpoints provide dynamic rendering based on Salesforce Lightning Page metadata. They optimize queries and field retrieval based on page configuration.

5. **File Uploads**: Use `multipart/form-data` encoding. Max file size is 5-50MB depending on endpoint.

6. **Security**: 
   - All endpoints except `/health`, `/config/*`, and `/auth/login` require authentication
   - Role-based access control (RBAC) for admin and PM features
   - Field-level security and object-level security enforced

7. **Chatter**: @mentions support both Salesforce Users and Team_Member__c records. The backend handles actor resolution and notification tracking.

---

## Support

For questions or issues, please contact the development team or refer to the project documentation in `docs/`.

**Last Updated:** December 9, 2025
**API Version:** v1
**Base URL:** https://knocker-prod-d9d209c5c2c9.herokuapp.com/api/v1
