# API Documentation

Base URL: `http://localhost:5000/api`

All protected endpoints require:

```http
Authorization: Bearer <jwt-token>
```

## Auth

### Register

`POST /auth/register`

Body:

```json
{
  "username": "Aneela",
  "email": "aneela@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "username": "Aneela",
    "email": "aneela@example.com",
    "createdAt": "2026-05-21T00:00:00.000Z"
  }
}
```

### Login

`POST /auth/login`

Body:

```json
{
  "email": "aneela@example.com",
  "password": "password123"
}
```

Response matches register.

### Current User

`GET /auth/me`

Protected: yes

Response:

```json
{
  "user": {
    "id": "user-id",
    "username": "Aneela",
    "email": "aneela@example.com",
    "createdAt": "2026-05-21T00:00:00.000Z"
  }
}
```

## Conversations

### List Conversations

`GET /conversations`

Protected: yes

Returns conversation summaries without message history.

### Create Conversation

`POST /conversations`

Protected: yes

Body:

```json
{
  "title": "New chat",
  "systemPrompt": "You are a helpful, concise AI assistant.",
  "temperature": 0.7
}
```

All fields are optional.

### Get Conversation

`GET /conversations/:id`

Protected: yes

Returns the full conversation with messages.

### Update Conversation

`PATCH /conversations/:id`

Protected: yes

Body:

```json
{
  "title": "Project planning",
  "systemPrompt": "You are a senior software architect.",
  "temperature": 0.4
}
```

### Delete Conversation

`DELETE /conversations/:id`

Protected: yes

Returns `204 No Content`.

### Stream Message

`POST /conversations/:id/messages`

Protected: yes

Body:

```json
{
  "content": "Explain JWT authentication in Express."
}
```

Response content type: `text/event-stream`

Server-sent events:

```text
data: {"token":"JWT "}

data: {"token":"authentication "}

data: {"done":true,"conversation":{...}}
```

If an error occurs:

```text
data: {"error":"AI response failed."}
```

## Validation And Limits

- Username: 2-40 characters
- Password: minimum 8 characters
- Conversation title: maximum 80 characters
- System prompt: maximum 2000 characters
- Message content: 1-12000 characters
- Temperature: 0-2
- Rate limit: controlled by backend environment variables
