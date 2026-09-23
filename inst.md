# Task: Refactor Unfazed Chat to a Real-Time WebSocket Architecture

You are working on my Unfazed therapist-booking application.

I already have a conversation/message API architecture. Before modifying ANYTHING, inspect the existing codebase carefully, especially:

* `apps/websocket`
* `apps/api/routes/v1/conversation`
* `apps/api/routes/v1/message`
* `apps/api/routes/v1/notification`
* WebSocket managers under:

  * `apps/websocket/manager/userManager.ts`
  * `apps/websocket/manager/messageManager.ts`
  * `apps/websocket/manager/conversationManger.ts`
  * notification/pub-sub related files under `apps/websocket`
* Prisma schema and generated database types
* Existing authentication logic
* Existing frontend chat/message components
* Existing Axios/API service functions
* Existing Redis configuration
* Existing worker infrastructure

Do NOT blindly rewrite the architecture. First understand what already exists and then modify it incrementally.

---

# CORE ARCHITECTURAL IDEA

I want the application to have a clear separation between:

1. HTTP API = CRUD/query/persistence-oriented operations
2. WebSocket = real-time communication
3. In-memory WebSocket managers = extremely fast temporary runtime state
4. Redis/queue = asynchronous message pipeline
5. Worker = database persistence/enrichment/background processing
6. PostgreSQL/Prisma = durable source of truth

The frontend should NOT send every chat message through Axios.

For actual real-time chat communication, the frontend should primarily communicate with the WebSocket server.

The desired flow is:

```text
CLIENT FRONTEND
      |
      | WebSocket
      v
WEBSOCKET SERVER
      |
      +----> UserManager
      |
      +----> ConversationManager
      |
      +----> MessageManager
      |
      +----> In-memory message state
      |
      +----> Redis / Queue
                  |
                  v
               WORKER
                  |
                  v
             API / Service
                  |
                  v
              PostgreSQL
```

The frontend may still use Axios for normal REST operations such as:

* fetching conversation history
* fetching older messages
* creating a conversation
* retrieving conversation list
* searching users
* fetching notifications
* marking messages as read if that is designed as CRUD
* profile-related operations
* other non-real-time operations

But sending a new chat message should NOT require:

```text
Frontend
   |
   | Axios POST /messages
   v
API
   |
   v
Database
```

because that makes the actual chat interaction dependent on HTTP request/response latency.

Instead:

```text
Frontend
   |
   | WebSocket SEND_MESSAGE
   v
WebSocket Server
   |
   | immediately update memory
   |
   | immediately broadcast
   v
Recipient
```

and persistence happens asynchronously.

---

# 1. WEBSOCKET IS THE REAL-TIME TRANSPORT

When a client sends a message:

```json
{
  "type": "SEND_MESSAGE",
  "conversationId": "conversation-id",
  "receiverId": "receiver-id",
  "content": "Hello"
}
```

the WebSocket server should immediately validate the basic information and process it.

The WebSocket server should NOT wait for PostgreSQL before delivering the message.

The important principle is:

> A chat message should feel instantaneous to both users even if the database is temporarily slow.

For example:

```text
Alice
  |
  | SEND_MESSAGE
  v
WebSocket
  |
  |----> create temporary/in-memory message
  |
  |----> send MESSAGE_CREATED to Bob
  |
  |----> send acknowledgement to Alice
  |
  |----> enqueue persistence job
  |
  v
Queue
```

The user should not experience:

```text
SEND
  ↓
wait for PostgreSQL
  ↓
wait for Prisma
  ↓
wait for API
  ↓
finally show message
```

---

# 2. IN-MEMORY MESSAGE STATE

Inside:

```text
apps/websocket
```

create/use managers for runtime state.

For example:

```text
UserManager
ConversationManager
MessageManager
```

The exact implementation should follow the existing project architecture after inspecting the current code.

The purpose of the managers is NOT to permanently store messages.

They are runtime state.

For example:

```ts
Map<UserId, WebSocket>
```

for connected users.

And potentially:

```ts
Map<ConversationId, Message[]>
```

for short-lived message state, pending messages, or message sequencing.

Do not treat this memory as the permanent database.

If the WebSocket server crashes:

```text
in-memory state can disappear
```

That is acceptable because PostgreSQL is the durable source of truth.

---

# 3. MESSAGE LIFECYCLE

Design the message lifecycle carefully.

A message should have a lifecycle similar to:

```text
CLIENT SEND
    |
    v
WEBSOCKET SERVER
    |
    v
VALIDATE
    |
    v
GENERATE MESSAGE ID
    |
    v
CREATE TEMPORARY MESSAGE
    |
    v
STORE IN MEMORY
    |
    +----------------------+
    |                      |
    v                      v
BROADCAST                QUEUE
    |                      |
    v                      v
RECIPIENT              WORKER
                           |
                           v
                       DATABASE
```

The key idea is that broadcasting does not wait for persistence.

---

# 4. MESSAGE ACKNOWLEDGEMENT

Do not simply fire a message and forget it.

The sender should receive an acknowledgement.

For example:

```json
{
  "type": "MESSAGE_ACK",
  "clientMessageId": "client-generated-id",
  "messageId": "server-generated-id",
  "status": "QUEUED"
}
```

This allows the frontend to transition:

```text
sending
   ↓
queued
   ↓
persisted
```

Potential statuses:

```text
SENDING
QUEUED
PERSISTED
FAILED
```

The exact status model should be determined after inspecting the existing schema.

---

# 5. CLIENT MESSAGE ID / IDEMPOTENCY

The frontend should generate a temporary ID:

```text
clientMessageId
```

Example:

```json
{
  "type": "SEND_MESSAGE",
  "clientMessageId": "temp-123",
  "conversationId": "abc",
  "content": "Hello"
}
```

The server generates the durable message ID.

This is important because the same message could potentially be sent twice due to:

* reconnect
* retry
* network problems
* duplicate WebSocket events

The worker/database layer should be designed so duplicate jobs do not create duplicate messages.

Use the existing Prisma schema and modify it only if necessary.

---

# 6. QUEUE ARCHITECTURE

Create a message persistence queue.

Do not make the WebSocket server directly perform the expensive database operation.

The WebSocket server should do something conceptually like:

```text
receive message
      ↓
validate
      ↓
create runtime message
      ↓
broadcast
      ↓
enqueue persistence job
      ↓
return
```

The queue job could contain:

```json
{
  "messageId": "server-message-id",
  "clientMessageId": "client-message-id",
  "conversationId": "conversation-id",
  "senderId": "sender-id",
  "receiverId": "receiver-id",
  "content": "Hello",
  "createdAt": "timestamp"
}
```

Use the project's existing Redis infrastructure if it already supports queues.

Do not introduce another queue technology unnecessarily.

If BullMQ or another queue is already present, use the existing infrastructure.

---

# 7. WORKER

The worker consumes message persistence jobs.

Conceptually:

```text
Redis Queue
     |
     v
Message Worker
     |
     v
Validate / enrich
     |
     v
Message Service
     |
     v
Message Repository
     |
     v
Prisma
     |
     v
PostgreSQL
```

The worker should be responsible for database persistence.

It can also perform enrichment if required.

For example:

```text
message job
   |
   +--> verify conversation
   |
   +--> verify sender
   |
   +--> enrich metadata
   |
   +--> persist message
   |
   +--> update conversation.lastMessage
   |
   +--> update timestamps
   |
   +--> trigger notification event
```

Do not duplicate business logic between the WebSocket server and worker.

Keep responsibilities clean.

---

# 8. IMPORTANT: DATABASE IS STILL THE SOURCE OF TRUTH

The in-memory WebSocket layer is NOT the database.

The architecture must guarantee:

```text
Memory = fast temporary runtime state

Redis Queue = asynchronous delivery/persistence pipeline

PostgreSQL = durable source of truth
```

When a user opens a conversation:

```text
Frontend
   |
   | Axios GET conversation history
   v
API
   |
   v
PostgreSQL
```

Then WebSocket handles new real-time messages.

This gives us:

```text
Initial/history data
        ↓
       HTTP
        ↓
    PostgreSQL

Live updates
        ↓
    WebSocket
        ↓
   In-memory state
        ↓
      Queue
        ↓
     Worker
        ↓
   PostgreSQL
```

---

# 9. FRONTEND RESPONSIBILITY

The frontend should have two communication mechanisms.

## HTTP/Axios

Use Axios for:

```text
GET conversations
GET conversation messages
GET older messages
CREATE conversation
GET user information
GET notifications
OTHER CRUD
```

## WebSocket

Use WebSocket for:

```text
SEND_MESSAGE
RECEIVE_MESSAGE
MESSAGE_ACK
MESSAGE_PERSISTED
TYPING_START
TYPING_STOP
USER_ONLINE
USER_OFFLINE
MESSAGE_READ
MESSAGE_DELIVERED
CONVERSATION_UPDATED
REAL_TIME_NOTIFICATION
```

Do not create Axios POST requests for every new chat message.

---

# 10. TYPING INDICATOR

Typing indicators should NEVER hit PostgreSQL.

Example:

```text
Alice types
    |
    v
WebSocket
    |
    v
Bob
```

Events:

```json
{
  "type": "TYPING_START",
  "conversationId": "abc"
}
```

and:

```json
{
  "type": "TYPING_STOP",
  "conversationId": "abc"
}
```

These should remain entirely in the WebSocket layer.

No database persistence is required.

---

# 11. ONLINE / OFFLINE STATUS

Online presence should also primarily be handled by:

```text
UserManager
```

Example:

```ts
Map<UserId, WebSocket>
```

When a user connects:

```text
UserManager.add(userId, ws)
```

When disconnected:

```text
UserManager.remove(userId)
```

The server can broadcast:

```text
USER_ONLINE
USER_OFFLINE
```

to relevant users.

Do not query PostgreSQL for every online/offline event.

If persistent last-seen information is required, asynchronously persist it separately.

---

# 12. CONVERSATION MANAGER

The existing:

```text
conversationManger.ts
```

should manage runtime conversation-related WebSocket state.

It should NOT become a replacement for the Conversation API.

The API remains responsible for persistent conversation CRUD.

The WebSocket manager is responsible for things such as:

```text
connected participants
active conversation sessions
routing events
broadcasting conversation events
```

---

# 13. MESSAGE MANAGER

The existing:

```text
messageManager.ts
```

should become the central runtime message coordinator.

Responsibilities may include:

```text
receive message
validate message
generate message ID
maintain pending/in-memory messages
send acknowledgement
broadcast message
enqueue persistence job
handle delivery state
handle retries where appropriate
```

Do not allow this class to become a giant class containing database business logic.

Database persistence belongs to the API/service/repository/worker side.

---

# 14. NOTIFICATION SYSTEM

Use the existing notification architecture.

For example:

```text
Message persisted
      |
      v
Notification event
      |
      v
Redis Pub/Sub
      |
      v
Notification Manager
      |
      v
WebSocket
      |
      v
Recipient
```

Do not create unnecessary HTTP calls between WebSocket managers.

Prefer the existing Redis infrastructure for cross-process communication.

---

# 15. MULTI-SERVER FUTURE

Design the architecture so that it can eventually scale to:

```text
                Load Balancer
                     |
        +------------+------------+
        |            |            |
        v            v            v
    WS Server 1  WS Server 2  WS Server 3
        |            |            |
        +------------+------------+
                     |
                  Redis
                     |
             Pub/Sub / Queue
                     |
                  Worker
                     |
                PostgreSQL
```

This means local Maps are only local runtime state.

Do NOT assume:

```text
Map<UserId, WebSocket>
```

is globally available.

Redis should eventually handle cross-instance coordination.

For now, implement the architecture cleanly without overengineering.

---

# 16. FAILURE HANDLING

Think carefully about these cases:

### WebSocket disconnects after message broadcast

The message may already be queued.

The worker should still persist it.

### Worker crashes

The queue should retain/retry the job according to the existing queue configuration.

### Database temporarily unavailable

The WebSocket server should not become blocked waiting for PostgreSQL.

The message remains in the queue and can be retried.

### Frontend reconnects

The frontend should fetch authoritative conversation history through HTTP and reconcile any temporary messages.

### Duplicate message

Use:

```text
clientMessageId
```

and/or an idempotency key to prevent duplicate persistence.

---

# 17. DO NOT TURN EVERYTHING INTO WEBSOCKET

I do NOT want the entire application converted to WebSocket.

Use the correct transport for the operation.

### HTTP

```text
CRUD
queries
history
profiles
search
initial page data
```

### WebSocket

```text
real-time messages
typing
presence
delivery/read events
real-time notifications
live conversation events
```

### Queue/Worker

```text
database persistence
background processing
notifications
enrichment
retries
```

This separation is extremely important.

---

# 18. FRONTEND UX

The user should feel that chat is instant.

When the user presses Send:

```text
User clicks Send
      ↓
Immediately render optimistic message
      ↓
WebSocket SEND_MESSAGE
      ↓
Server acknowledgement
      ↓
Recipient receives message
      ↓
Persistence happens asynchronously
```

Do NOT:

```text
click Send
   ↓
Axios
   ↓
wait
   ↓
database
   ↓
response
   ↓
render message
```

That would defeat the purpose of the real-time architecture.

---

# 19. RECONCILIATION

Because messages may initially exist only in memory, the frontend needs a reconciliation strategy.

For example:

```text
temporary clientMessageId
        ↓
server messageId
        ↓
persisted message
```

When the worker finishes persistence, the system can emit an event such as:

```json
{
  "type": "MESSAGE_PERSISTED",
  "clientMessageId": "temp-123",
  "messageId": "db-message-id"
}
```

The frontend can replace/update the optimistic message.

If this event is not necessary because the server-generated message ID is already sufficient, use the simpler design.

Do not over-engineer this.

---

# 20. SECURITY

Never trust:

```text
senderId
receiverId
conversationId
```

from the frontend blindly.

Authenticate the WebSocket connection.

Derive the authenticated user from the WebSocket authentication mechanism.

Verify that:

```text
authenticated user
        |
        v
is actually a participant
        |
        v
in this conversation
```

before accepting the message.

The frontend should not be able to impersonate another user by simply changing:

```json
{
  "senderId": "another-user"
}
```

---

# 21. CODEBASE-FIRST IMPLEMENTATION

Before writing code:

1. Inspect all existing WebSocket files.
2. Inspect UserManager.
3. Inspect MessageManager.
4. Inspect ConversationManager.
5. Inspect notification/pub-sub implementation.
6. Inspect conversation API routes.
7. Inspect message API routes.
8. Inspect service/repository layers.
9. Inspect Prisma message/conversation models.
10. Inspect Redis configuration.
11. Inspect worker applications.
12. Inspect frontend chat implementation.
13. Identify existing Axios calls used for messages.
14. Identify existing WebSocket client implementation.
15. Understand the current authentication flow.

Then produce a short architecture assessment.

Only after that should you modify files.

---

# 22. DO NOT BREAK EXISTING APIs

Existing HTTP APIs should continue to work.

The goal is to ADD/REFACTOR the real-time path rather than unnecessarily deleting working CRUD APIs.

For example:

```text
GET /conversation/:id/messages
```

can remain.

But:

```text
POST /message
```

should no longer be the primary mechanism used by the frontend for live chat messages if WebSocket is available.

It may remain for administrative, fallback, testing, or other appropriate use cases if the existing architecture needs it.

---

# 23. EXPECTED FINAL ARCHITECTURE

The final architecture should conceptually look like:

```text
                         FRONTEND
                            |
              +-------------+-------------+
              |                           |
            Axios                      WebSocket
              |                           |
              v                           v
        HTTP API                    WS SERVER
              |                           |
              v                     +-----+------+
          Services                  |            |
              |                UserManager  MessageManager
              v                     |            |
          Repository          ConversationManager|
              |                     |            |
              v                     +-----+------+
         PostgreSQL                       |
                                          |
                                       Redis Queue
                                          |
                                          v
                                       Worker
                                          |
                                          v
                                   Message Service
                                          |
                                          v
                                     PostgreSQL


Real-time notification:

Worker / Event
      |
      v
Redis Pub/Sub
      |
      v
Notification Manager
      |
      v
WebSocket
      |
      v
Frontend
```

---

# 24. MOST IMPORTANT PRINCIPLE

The main architectural rule is:

> WebSocket should handle the real-time conversation experience. HTTP should handle persistent CRUD/query operations. The queue and worker should decouple real-time delivery from database persistence.

The user should experience:

```text
SEND
 ↓
INSTANT
 ↓
RECEIVE
```

while the backend internally performs:

```text
SEND
 ↓
VALIDATE
 ↓
IN-MEMORY STATE
 ↓
BROADCAST
 ↓
QUEUE
 ↓
WORKER
 ↓
DATABASE
```

The database should not be on the critical path of the real-time user experience unless absolutely necessary for authorization or consistency checks.

---

# 25. IMPLEMENTATION REQUIREMENTS

Use TypeScript.

Follow the existing project's coding style.

Do not introduce unnecessary dependencies.

Reuse existing Redis, Prisma, Axios, queue, worker, authentication, and WebSocket infrastructure where possible.

Keep managers focused.

Keep services focused.

Keep repositories focused on persistence.

Keep workers focused on asynchronous processing.

Do not put Prisma queries directly inside WebSocket managers.

Do not put business-heavy database logic directly inside the WebSocket event handler.

Do not make the frontend call Axios to send every chat message.

Do not persist typing indicators.

Do not persist every presence event synchronously.

Do not block WebSocket message delivery waiting for PostgreSQL.

Before modifying files, inspect the actual current implementations and adapt the design to them.

After implementation, test:

1. Client connects.
2. Therapist connects.
3. Client sends message.
4. WebSocket immediately receives it.
5. Recipient receives it in real time.
6. Sender receives acknowledgement.
7. Message enters queue.
8. Worker consumes queue.
9. Worker persists message.
10. Conversation last-message metadata is updated.
11. Reconnection works.
12. Duplicate messages are handled safely.
13. Unauthorized conversation access is rejected.
14. HTTP message history still works.
15. Typing indicators work without database calls.
16. Online/offline presence works.
17. Notification/pub-sub still works.

Finally, show me:

* files changed
* architecture implemented
* WebSocket event types
* queue payload
* worker flow
* frontend communication flow
* any schema changes
* any assumptions made
* any remaining TODOs

Do not modify unrelated parts of the application.
