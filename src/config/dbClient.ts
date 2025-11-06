import { PrismaClient } from "@prisma/client";

//Creates instance of prisma client that connects to your database (using the DATABASE_URL from .env)
// Exposes all your models (e.g. prisma.user, prisma.post, etc.)
// Handles connection pooling, transactions, and query typing behind the scenes.
const Prisma = new PrismaClient();

export default Prisma;