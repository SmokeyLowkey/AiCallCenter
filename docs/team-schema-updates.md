# Team-Related Schema Updates

This document outlines the planned updates to the Prisma schema to support team management functionality in the AI Call Center Solution.

## Current User Model

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          UserRole  @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  VerificationToken VerificationToken[]
}
```

## Planned Updates

### 1. Enhanced User Model

We'll add the following fields to the User model:

```prisma
model User {
  // Existing fields...
  
  // Professional profile fields
  jobTitle       String?
  department     String?
  phoneNumber    String?
  skills         String[]  // Array of skills
  profileImage   String?   // URL to profile image
  availability   Json?     // JSON object for availability schedule
  
  // Team relationships
  teamId         String?   // Current primary team
  team           Team?     @relation("TeamMember", fields: [teamId], references: [id])
  ownedTeams     Team[]    @relation("TeamOwner")
  memberTeams    TeamMember[]
}
```

### 2. New Team Model

```prisma
model Team {
  id             String      @id @default(cuid())
  name           String
  description    String?
  industry       String?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  
  // Owner relationship
  ownerId        String
  owner          User        @relation("TeamOwner", fields: [ownerId], references: [id])
  
  // Members relationship
  members        User[]      @relation("TeamMember")
  teamMembers    TeamMember[]
  
  // Invite codes
  inviteCodes    InviteCode[]
}
```

### 3. TeamMember Model (for role-specific team membership)

```prisma
model TeamMember {
  id             String      @id @default(cuid())
  userId         String
  teamId         String
  role           UserRole    @default(AGENT)
  joinedAt       DateTime    @default(now())
  
  // Relations
  user           User        @relation(fields: [userId], references: [id])
  team           Team        @relation(fields: [teamId], references: [id])
  
  // Ensure a user can only have one role per team
  @@unique([userId, teamId])
}
```

### 4. InviteCode Model

```prisma
model InviteCode {
  id             String      @id @default(cuid())
  code           String      @unique
  teamId         String
  createdAt      DateTime    @default(now())
  expiresAt      DateTime
  usedCount      Int         @default(0)
  maxUses        Int         @default(10)
  
  // Relation
  team           Team        @relation(fields: [teamId], references: [id])
}
```

## Implementation Steps

1. Update the Prisma schema with these new models
2. Run `prisma db push` to update the database
3. Run `prisma generate` to update the Prisma client
4. Update the NextAuth types to include the new fields
5. Create API endpoints for team management

## Next Steps

After updating the schema, we'll need to:

1. Create UI components for team creation and management
2. Update the registration process to include team-related fields
3. Implement team invitation functionality
4. Add role-based access control for team features