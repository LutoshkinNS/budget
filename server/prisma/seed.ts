import { PrismaClient, Prisma } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

const categoryData: Prisma.CategoryCreateInput[] = [
    {
        name: "Alice",
        user: {
            create: {}
        }
    },
];
export async function main() {
    for (const category of categoryData) {
        await prisma.category.create({ data: category });
    }
}
main();