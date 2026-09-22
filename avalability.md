first read this packages\db\prisma\schema.prisma
then this packages\types\validations\avalability.types.ts 

Yes — much shorter. You only need the **TimeSlot + Availability system design**, without appointments, booking, Redis, payments, etc.

# Unfazed — TimeSlot & Availability System

## Goal

Build a therapist availability system using **predefined time slots**.

The system has two main entities:

* `TimeSlot` → globally predefined time ranges.
* `Availability` → connects a therapist with a day and a predefined time slot.

---

## 1. TimeSlot

Time slots are fixed and seeded into the database once.

Each session is **50 minutes**, followed by a **10-minute gap**.

Working window:

```text
09:00 → 16:50
```

Slots:

```text
1 → 09:00 - 09:50
2 → 10:00 - 10:50
3 → 11:00 - 11:50
4 → 12:00 - 12:50
5 → 13:00 - 13:50
6 → 14:00 - 14:50
7 → 15:00 - 15:50
8 → 16:00 - 16:50
```

Prisma:

```prisma
model TimeSlot {
  id        Int      @id
  startTime DateTime @db.Time
  endTime   DateTime @db.Time

  availabilities Availability[]
}
```

TimeSlots are **global**, not therapist-specific.

They are inserted once using a Prisma seed.

---

## 2. Availability

Availability represents which slots a particular therapist works on a particular day.

Example:

```text
Therapist A

MONDAY:
Slot 1
Slot 2
Slot 3
Slot 6

TUESDAY:
Slot 1
Slot 2
```

Database:

```text
therapistId | dayOfWeek | timeSlotId
-------------------------------------
T1          | MONDAY    | 1
T1          | MONDAY    | 2
T1          | MONDAY    | 3
T1          | MONDAY    | 6
T1          | TUESDAY   | 1
T1          | TUESDAY   | 2
```

Prisma:

```prisma
enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

model Availability {
  id          String   @id @default(uuid())

  dayOfWeek   DayOfWeek

  therapistId String
  therapist   Therapist @relation(
    fields: [therapistId],
    references: [id]
  )

  timeSlotId  Int
  timeSlot    TimeSlot @relation(
    fields: [timeSlotId],
    references: [id]
  )

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([therapistId, dayOfWeek, timeSlotId])
  @@index([therapistId, dayOfWeek])
}
```

---

## 3. Relationship

```text
Therapist
    │
    │
    ▼
Availability
    │
    │ timeSlotId
    ▼
TimeSlot
```

Example:

```text
Therapist A
    │
    ├── Monday → Slot 1
    ├── Monday → Slot 2
    ├── Monday → Slot 3
    └── Monday → Slot 6

TimeSlot
    │
    ├── 1 → 09:00 - 09:50
    ├── 2 → 10:00 - 10:50
    ├── 3 → 11:00 - 11:50
    └── 6 → 14:00 - 14:50
```

---

## 4. API

Therapist:

```http
POST   /api/v1/availability/create
GET    /api/v1/availability/
PATCH  /api/v1/availability/:id
DELETE /api/v1/availability/:id
```

TimeSlots:

```http
GET /api/v1/time-slots
```

The frontend gets the available TimeSlots from the backend and sends the selected `timeSlotId`.

Example:

```json
{
  "dayOfWeek": "MONDAY",
  "timeSlotId": 1
}
```

`therapistId` should come from the authenticated user, **not from the request body**.

---

## 5. Validation

```ts
const DayOfWeekSchema = z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
]);

const CreateAvailabilityValidation = z.object({
    dayOfWeek: DayOfWeekSchema,

    timeSlotId: z
        .number()
        .int()
        .positive(),
});
```

The service should additionally verify that the `timeSlotId` exists in the `TimeSlot` table.

---

## 6. Important Rules

* `TimeSlot` is global and seeded once.
* `Availability` belongs to a therapist.
* Availability stores `timeSlotId`, not arbitrary `startTime/endTime`.
* `therapistId` comes from authentication.
* A therapist cannot have the same slot twice on the same day.
* Use `@@unique([therapistId, dayOfWeek, timeSlotId])`.
* TimeSlot IDs should remain stable.
* Keep controllers thin; business logic belongs in the service.
* Appointment/booking logic will be designed separately later.

### Core idea

```text
Fixed TimeSlots
      +
Therapist's weekly Availability
      ↓
Therapist's available schedule
```
