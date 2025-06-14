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

## Current State

### Implemented Features

- **Database Structure**
  - Complete schema design for users, plants, events, posts, comments, and likes
  - SQLite database with Prisma ORM integration
  - Initial data seeding for testing

- **Calendar System**
  - API endpoints for CRUD operations on events
  - Temporary authentication utility functions
  - Backend structure for managing plant care schedules

- **Basic UI Components**
  - Landing page with login/registration modals
  - User authentication forms (login/registration)
  - Dashboard, user profile, and feed page skeletons

### In Progress

- **User Authentication**
  - API routes for login and registration (placeholder implementation)
  - Frontend components for authentication
  - Session management (not yet implemented)

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

## Development Roadmap

### Short-term Goals

1. **Complete User Authentication System**
   - Implement proper JWT or session-based authentication
   - Add password hashing and security features
   - Connect authentication to database
   - Integrate with frontend components

2. **Finish Calendar Feature**
   - Complete calendar event CRUD operations
   - Implement recurring events
   - Add notifications for upcoming care tasks
   - Connect events to specific plants

3. **Plant Management**
   - Create plant profile pages
   - Implement plant CRUD operations
   - Add care instructions for different plant types

### Medium-term Goals

1. **Social Networking Features**
   - Implement post creation and sharing
   - Add comment and like functionality
   - Create social feed with filtering options
   - Add user following/followers system

2. **Plant Identification**
   - Integrate with plant identification API or ML model
   - Allow users to upload photos for identification
   - Save identification results to plant database
   - Suggest care instructions based on identified plants

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

#### Create a new event
```
POST /api/events
Body: { title, start, end, userId, plantId? }
```

#### Update an event
```
PUT /api/events/:id
Body: { title?, start?, end?, plantId? }
```

#### Delete an event
```
DELETE /api/events/:id
```

### User API (In Development)

#### Register a new user
```
POST /api/users/auth/register
Body: { email, password }
```

#### Login
```
POST /api/users/auth/login
Body: { email, password }
```

## Contributing

We welcome contributions to the Plant Care Assistant project! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's style guidelines and includes appropriate tests.

---

This README provides an overview of the Plant Care Assistant application's current state and future development plans. As the project evolves, this document will be updated to reflect new features and improvements.