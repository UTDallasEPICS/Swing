//prisma client singleton
//ensures one instance of client is created and used

import { PrismaClient } from "@prisma/client";

//global object for persistance
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

//create or reuse the PrismaCLient instance
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

//cache the instance in development
if (process.env.NODE_ENV !== 'production') { globalForPrisma.prisma = prisma; }

//export for use
export default prisma;