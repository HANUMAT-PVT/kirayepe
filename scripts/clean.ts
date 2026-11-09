import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log("All KirayePe collections cleared.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
