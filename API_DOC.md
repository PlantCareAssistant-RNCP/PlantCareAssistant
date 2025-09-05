# Plant Care Assistant API Documentation

This document provides comprehensive API documentation for the Plant Care Assistant application.

## Table of Contents

- [Authentication](#authentication)
- [Events API](#events-api)
- [Plants API](#plants-api)
- [Plant Types API](#plant-types-api)
- [Social API](#social-api)
- [User API](#user-api)
- [Upload API](#upload-api)

## Authentication

Authentication is handled through Supabase Auth. Most client applications should use the Supabase client SDK for:

- Sign up with email/password
- Sign in with email/password
- Sign in with third-party providers (if configured)
- Password reset
- Email verification
- Session management

See [Supabase Auth documentation](https://supabase.com/docs/guides/auth) for implementation details.

## Events API

### Get all events for current user

```
GET /api/events
```

### Get a specific event

```
GET /api/events/:eventId
```

### Create a new event

```
POST /api/events Content-Type: application/json Body: { title: string, start: ISO8601DateTime, end?: ISO8601DateTime, plantId?: number, notes?: string, recurringPattern?: string }
```

### Update an event

```
PUT /api/events/:eventId Content-Type: application/json Body: { title?: string, start?: ISO8601DateTime, end?: ISO8601DateTime, plantId?: number, notes?: string, recurringPattern?: string }
```

### Delete an event

```
DELETE /api/events/:eventId
```

### Get Events for a specific user

```
GET /api/users/:userId/events
```

### Get Events for a specific plant

```
GET /api/plants/:plantId/events
```

## Plants API

### Get all plants for current user

```
GET /api/plants
```

### Get a specific plant

```
GET /api/plants/:plantId
```

### Create a new plant

```
POST /api/plants Content-Type: application/json Body: { plant_name: string, plant_type_id: number, photo?: string }
```

### Update a plant

```
PUT /api/plants/:plantId Content-Type: application/json Body: { plant_name?: string, plant_type_id?: number, photo?: string }
```

### Delete a plant

```
DELETE /api/plants/:plantId
```

### Get plants for a specific user

```
GET /api/users/:userId/plants
```

### Get events for a specific plant

```
GET /api/plants/:plantId/events
```

## Plant Types API

### Get all plant types

```
GET /api/plant-types
```

### Create a new plant type

```
POST /api/plant-types Content-Type: application/json Body: { plant_type_name: string }
```

## Social API

### Posts

#### Get all posts (with filtering)

```
GET /api/social/posts Query: { userId?: string, plantId?: number }
```

#### Get a specific post

```
GET /api/social/posts/:postId
```

#### Create a new post

```
POST /api/social/posts Content-Type: multipart/form-data FormData: { title?: string, content: string, plant_id?: number, image?: File }
```

#### Update a post

```
PUT /api/social/posts/:postId Content-Type: multipart/form-data FormData: { title?: string, content?: string, image?: File, removeImage?: boolean }
```

#### Delete a post

```
DELETE /api/social/posts/:postId
```

### Comments

#### Get comments for a post

```
GET /api/social/posts/:postId/comments
```

#### Add a comment to a post

```
POST /api/social/posts/:postId/comments Content-Type: application/json Body: { content: string }
```

#### Update a comment

```
PUT /api/social/posts/:postId/comments/:commentId Content-Type: application/json Body: { content: string }
```

#### Delete a comment

```
DELETE /api/social/posts/:postId/comments/:commentId
```

### Likes

#### Like a post

```
POST /api/social/posts/:postId/likes
```

#### Unlike a post

```
DELETE /api/social/posts/:postId/likes
```

### Feed

#### Get social feed

```
GET /api/social/feed Query: { limit?: number, page?: number, plantTypeId?: number }
```

## User API

### Get all users (with search)

```
GET /api/users Query: { username?: string }
```

### Create a new user (Admin only)

```
POST /api/users Content-Type: application/json Body: { username: string, email: string, password: string }
```

### Get current user profile

```
GET /api/auth/me
```

### Get a specific user profile

```
GET /api/users/:userId
```

### Update user profile

```
PUT /api/users/:userId Content-Type: multipart/form-data FormData: { username?: string, bio?: string, avatar?: File, removeAvatar?: boolean }
```

### Delete a user (Admin only)

```
DELETE /api/users/:userId
```

## Authentication API

### Logout current user

```
POST /api/auth/logout
```

### Create user profile

```
POST /api/auth/create-user-profile Content-Type: application/json Body: { username: string, bio?: string, avatar?: File }
```

## Upload API

### Upload file

```
POST /api/upload Content-Type: multipart/form-data FormData: { file: File, bucket: "post-images" | "plant-images" }
```

---

For more information about the Plant Care Assistant project, see the [main README](README.md).
