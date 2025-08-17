# Plant Care Assistant

A comprehensive application for plant enthusiasts to manage their plant collection, schedule care activities, share experiences, and get plant identification assistance.

## Table of Contents

- [Overview](#overview)
- [Current State](#current-state)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Roadmap](#development-roadmap)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## Overview

Plant Care Assistant is a Next.js application designed to help users manage their plants effectively. The application combines personal plant management with social networking features, allowing users to share their plant care journey with others. Additionally, it plans to incorporate plant identification capabilities to help users identify unknown plants.

## Technology Stack

- **Frontend**
  - [Next.js 15](https://nextjs.org/docs) - React framework for server-rendered applications
  - [React 19](https://react.dev/) - UI library
  - [React Big Calendar](https://github.com/jquense/react-big-calendar) - Calendar component for scheduling
  - [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework

- **Backend**
  - [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) - Serverless functions for backend operations
  - [Prisma](https://www.prisma.io/docs/) - ORM for database access
  - [Supabase](https://supabase.com/docs) - Backend-as-a-service with auth and security features
  - [PostgreSQL](https://www.postgresql.org/docs/) - Relational database

- **Development Tools**
  - [TypeScript](https://www.typescriptlang.org/docs/) - Static type-checking
  - [Luxon](https://moment.github.io/luxon/#/) - Date and time handling library
  - [Playwright](https://playwright.dev/) - End-to-end testing framework
  - [Multer](https://github.com/expressjs/multer) - Middleware for handling file uploads

## Project Structure

```
plant-care-assistant/
├── app/                      # Next.js App Router structure
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   │   └── me/           # Current user info
│   │   ├── events/           # Calendar events API endpoints
│   │   ├── plants/           # Plant management endpoints
│   │   ├── social/           # Social networking features
│   │   │   ├── posts/        # Post management
│   │   │   ├── comments/     # Comment operations
│   │   │   └── feed/         # Social feed endpoints
│   │   └── users/            # User management API endpoints
│   ├── dashboard/            # Dashboard page
│   ├── features/             # Feature-specific pages
│   ├── homepage/             # Main application homepage
│   ├── userprofile/          # User profile page
│   └── utils/                # Utility functions
│       └── auth.ts           # Authentication utilities
├── components/               # Reusable React components
├── lib/                      # Library code
│   └── supabaseClient.ts     # Supabase client initialization
├── prisma/                   # Prisma ORM configuration
│   ├── migrations/           # Database structure migrations
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data for development
├── supabase/                 # Supabase configuration
│   └── migrations/           # Security policy migrations
├── public/                   # Static assets
└── .env                      # Environment variables (not in repo)
```

## Database Architecture

Our application uses a dual-system approach for database management, leveraging the strengths of both Prisma and Supabase:

### Prisma Responsibilities

- **Schema Definition**: The schema.prisma file defines our data models, relationships, and database structure
- **Database Migrations**: Manages structural changes to the database (adding/removing tables, columns, relationships)
- **ORM Functionality**: Provides type-safe database queries and data manipulation in our API routes
- **Data Seeding**: The seed.ts script populates the database with initial test data
- **Type Generation**: Creates TypeScript types based on our database schema

### Supabase Responsibilities

- **Authentication**: Manages user signup, login, password reset, and session management
- **Row Level Security (RLS)**: Enforces security policies at the database level, ensuring users can only access their own data
- **Policy Management**: SQL policies that control read/write access to database tables
- **Security Migrations**: Tracked in migrations to version control security changes

This separation of concerns allows us to use the right tool for each job:
- Prisma for data modeling and database interactions
- Supabase for authentication and security

When making changes to the application:
1. Use Prisma migrations for schema/structural changes
2. Use Supabase migrations for security policies


## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn package manager
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/plant-care-assistant.git
   cd plant-care-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create .env file with the following variables
   DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres"
   NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
   ```

4. Set up the database:
   ```bash
   # Push Prisma schema to the database
   npx prisma migrate dev --name init
   
   # Generate Prisma client
   npx prisma generate
   
   # Seed the database with initial data
   npx prisma db seed
   ```

5. Apply Supabase security policies:
   ```bash
   # If using Supabase CLI
   npx supabase migration new add_rls_policies
   # Edit the created migration file to add RLS policies
   npx supabase db push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Docker Setup

If you prefer to use Docker or can't/won't install Node.js locally:

### For Local Development

1. Clone this repository

2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your own Supabase credentials

4. Run with Docker Compose:
   ```bash
   docker compose up
   ```

### For Production Deployment

Provide environment variables through your deployment platform:

```bash
# Example for direct docker run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  -e DATABASE_URL=your-database-url \
  your-image-name
```

## Running the App

After setup (either method), open [http://localhost:3000](http://localhost:3000) to see the application.

## Development Roadmap

### Current Priorities
1. **Plant Management Enhancements**
   - Complete plant profile pages with care history
   - Add plant collection grouping and filtering
   - Implement care instruction templates by plant type

2. **Calendar Feature Enhancements**
   - Implement recurring events
   - Add notification system for upcoming care tasks
   - Improve UI/UX for calendar interactions

3. **Social Networking Frontend Implementation**
   - Complete user interface for post creation and viewing
   - Add frontend components for comments and likes
   - Implement social feed with post filtering

### Medium-term Goals
1. **Advanced Social Networking Features**
   - User following/followers system
   - Enhanced social feed with algorithmic sorting
   - Notification system for social interactions

### Long-term Goals

1. **Mobile/PWA Application**
   - Develop native or cross-platform mobile version
   - Add push notifications for plant care reminders

2. **Community Features**
   - Plant trading/marketplace
   - Community challenges and events

3. **Advanced Analytics**
   - Growth tracking for plants
   - Statistical analysis of care patterns
   - Personalized recommendations

## API Documentation

### Events API

#### Get a specific event
```
GET /api/events/:id
```

#### Get all events for current user
```
GET /api/events Query: { startDate?: YYYY-MM-DD, endDate?: YYYY-MM-DD }
```

#### Get Events for a specific user
```
GET /api/users/:userId/events Query: { startDate?: YYYY-MM-DD, endDate?: YYYY-MM-DD }
```

#### Create a new event
```
POST /api/events Content-Type: application/json Body: { title: string, start: ISO8601DateTime, end: ISO8601DateTime, plantId?: number, notes?: string, recurringPattern?: string }
```

#### Update an event
```
PUT /api/events/:id Content-Type: application/json Body: { title?: string, start?: ISO8601DateTime, end?: ISO8601DateTime, plantId?: number, notes?: string, recurringPattern?: string }
```

#### Delete an event
```
DELETE /api/events/:id
```

### Plants API

#### Get all plants for current user
```
GET /api/plants Query: { search?: string, sort?: "name"|"species"|"acquiredDate", filter?: string, page?: number, limit?: number }
```

#### Get a specific plant
```
GET /api/plants/:id
```

#### Create a new plant
```
POST /api/plants Content-Type: multipart/form-data FormData: { name: string, species: string, acquiredDate: YYYY-MM-DD, location?: string, notes?: string, image?: File }
```

#### Update a plant
```
PUT /api/plants/:id Content-Type: multipart/form-data FormData: { name?: string, species?: string, acquiredDate?: YYYY-MM-DD, location?: string, notes?: string, image?: File, removeImage?: boolean }
```

#### Delete a plant
```
DELETE /api/plants/:id
```

### Social API

#### Posts

##### Get all posts (with filtering)
```
GET /api/social/posts Query: { limit?: number, offset?: number, userId?: number, plantId?: number }
```

##### Get a specific post
```
GET /api/social/posts/:id
```

##### Create a new post
```
POST /api/social/posts Content-Type: multipart/form-data FormData: { title?: string, content: string, plant_id?: number, image?: File }
```

##### Update a post
```
PUT /api/social/posts/:id Content-Type: multipart/form-data FormData: { title?: string, content?: string, image?: File, removeImage?: boolean }
```

##### Delete a post
```
DELETE /api/social/posts/:id
```

#### Comments

##### Get comments for a post
```
GET /api/social/posts/:postId/comments Query: { limit?: number, offset?: number }
```

##### Add a comment to a post
```
POST /api/social/posts/:postId/comments Content-Type: application/json Body: { content: string }
```

##### Update a comment
```
PUT /api/social/comments/:commentId Content-Type: application/json Body: { content: string }
```

##### Delete a comment
```
DELETE /api/social/comments/:commentId
```

#### Likes

##### Like a post
```
POST /api/social/posts/:postId/likes
```

##### Unlike a post
```
DELETE /api/social/posts/:postId/likes
```

### User API

#### Get current user profile
```
GET /api/users/me
```


#### Update user profile
```
PUT /api/users/me Content-Type: multipart/form-data FormData: { username?: string, bio?: string, avatar?: File, removeAvatar?: boolean }
```

#### Authentication
Authentication is handled through Supabase Auth. The API routes below are part of the backend implementation, but most client applications should use the Supabase client SDK:

##### Register a new user
```
POST /api/auth/register Body: { email: string, password: string, username?: string }
```

#### Login
```
POST /api/auth/login Body: { email: string, password: string }
```

#### Logout
```
POST /api/auth/logout
```

#### Client SDK Features

The following operations are available through the Supabase client SDK:

- Sign up with email/password
- Sign in with email/password
- Sign in with third-party providers (if configured)
- Password reset
- Email verification
- Session management

See [Supabase Auth documentation](https://supabase.com/docs/guides/auth) for implementation details.

## Testing

The project uses Playwright for end-to-end testing.

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with UI mode
npm run test:ui

# Generate test reports
npm run test:report

## Contributing

We welcome contributions to the Plant Care Assistant project! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature-amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature-amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's style guidelines and includes appropriate tests.

---

This README provides an overview of the Plant Care Assistant application's current state and future development plans. As the project evolves, this document will be updated to reflect new features and improvements.