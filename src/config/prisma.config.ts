import "./env.config";

import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export default prisma;
