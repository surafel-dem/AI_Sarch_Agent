Prisma Implementation Guide: Database Schema and Integration

Table of Contents
Overview
Database Schema
Implementation Steps
Database Configuration
Models and Relationships
Best Practices
Integration Patterns
Migration Strategy
Overview
This document outlines the implementation of a PostgreSQL database using Prisma ORM, focusing on user management, payments, and subscriptions.

Tech Stack
Prisma ORM
PostgreSQL
TypeScript
Next.js 13+
Database Schema
Core Models Overview
prisma
CopyInsert
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
Model Definitions
1. User Model
prisma
CopyInsert
model user {
  id                Int      @id @default(autoincrement())
  created_time      DateTime @default(now())
  email             String   @unique
  first_name        String?
  last_name         String?
  gender            String?
  profile_image_url String?
  user_id           String   @unique
  subscription      String?
}
2. Payments Model
prisma
CopyInsert
model payments {
  id               Int      @id @default(autoincrement())
  created_time     DateTime @default(now())
  stripe_id        String
  email            String
  amount           String
  payment_time     String
  payment_date     String
  currency         String
  user_id          String
  customer_details String
  payment_intent   String
}
3. Subscriptions Model
prisma
CopyInsert
model subscriptions {
  id                        Int      @id @default(autoincrement())
  created_time              DateTime @default(now())
  subscription_id           String
  stripe_user_id            String
  status                    String
  start_date               String
  end_date                 String?
  plan_id                  String
  default_payment_method_id String?
  email                    String
  user_id                  String
}
4. Subscription Plans Model
prisma
CopyInsert
model subscriptions_plans {
  id           Int      @id @default(autoincrement())
  created_time DateTime @default(now())
  plan_id      String
  name         String
  description  String
  amount       String
  currency     String
  interval     String
}
5. Invoices Model
prisma
CopyInsert
model invoices {
  id              Int      @id @default(autoincrement())
  created_time    DateTime @default(now())
  invoice_id      String
  subscription_id String
  amount_paid     String
  amount_due      String?
  currency        String
  status          String
  email           String
  user_id         String?
}
Implementation Steps
1. Initial Setup
bash
CopyInsert
# Install Prisma
npm install prisma --save-dev
npm install @prisma/client

# Initialize Prisma
npx prisma init
2. Environment Configuration
env
CopyInsert
DATABASE_URL="postgresql://user:password@host:port/db?schema=public"
DIRECT_URL="postgresql://user:password@host:port/db?schema=public"
3. Database Migration
bash
CopyInsert
# Generate migration
npx prisma migrate dev --name init

# Apply migration
npx prisma migrate deploy
Database Configuration
1. Connection Setup
typescript
CopyInsert
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
2. Connection Pool Configuration
typescript
CopyInsert
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")  // Connection pooling
  directUrl = env("DIRECT_URL")    // Direct connection
}
Models and Relationships
1. User Management
Primary user information storage
Unique constraints on email and user_id
Optional fields for flexibility
2. Payment Processing
Stripe integration
Transaction tracking
Customer details storage
3. Subscription Management
Plan tracking
Payment method management
Status monitoring
Best Practices
1. Schema Design
prisma
CopyInsert
// Common patterns across models
model BaseModel {
  id           Int      @id @default(autoincrement())
  created_time DateTime @default(now())
}
2. Type Safety
typescript
CopyInsert
// types/prisma.d.ts
import { User, Payment, Subscription } from '@prisma/client'

export interface ExtendedUser extends User {
  payments: Payment[]
  subscriptions: Subscription[]
}
3. Query Optimization
typescript
CopyInsert
// Example of optimized query
const getUserWithSubscriptions = async (userId: string) => {
  return prisma.user.findUnique({
    where: { user_id: userId },
    include: {
      subscriptions: {
        where: { status: 'active' }
      }
    }
  })
}
Integration Patterns
1. API Route Integration
typescript
CopyInsert
// pages/api/users/[id].ts
import { prisma } from '@/lib/prisma'

export default async function handler(req, res) {
  const { id } = req.query
  
  const user = await prisma.user.findUnique({
    where: { user_id: id },
    include: {
      subscriptions: true,
      payments: true
    }
  })
  
  return res.json(user)
}
2. Service Layer Pattern
typescript
CopyInsert
// services/user.service.ts
export class UserService {
  static async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      include: {
        subscriptions: true
      }
    })
  }
  
  static async updateSubscription(userId: string, planId: string) {
    return prisma.subscriptions.upsert({
      where: { user_id: userId },
      update: { plan_id: planId },
      create: { user_id: userId, plan_id: planId }
    })
  }
}
Migration Strategy
1. Development Migrations
bash
CopyInsert
# Create migration
npx prisma migrate dev --name add_user_fields

# Reset database
npx prisma migrate reset
2. Production Migrations
bash
CopyInsert
# Deploy migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
3. Schema Versioning
Use descriptive migration names
Keep migrations small and focused
Document breaking changes
Performance Considerations
1. Indexing Strategy
prisma
CopyInsert
model user {
  email     String  @unique
  user_id   String  @unique
  @@index([email, user_id])
}
2. Connection Pooling
Use connection pooling in production
Configure pool size based on load
Monitor connection usage
3. Query Optimization
Use appropriate includes
Implement pagination
Optimize where clauses
This implementation provides:

Robust data model for user management
Scalable subscription system
Type-safe database operations
Clean and maintainable code structure
Would you like me to elaborate on any specific aspect of this Prisma implementation?

Start with History ⌘⏎
Press Enter again to interrupt and send a new message
Start with History ⌘⏎



mention


Add images

Claude 3.5 Sonnet