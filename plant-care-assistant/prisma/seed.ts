import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import logger from "@utils/logger"

const prisma = new PrismaClient();

async function seed() {
  // Create user profiles with UUID IDs
  const user1Id = randomUUID();
  const user2Id = randomUUID();
  const user3Id = randomUUID();
  const user4Id = randomUUID();

  await prisma.userProfile.createMany({
    data: [
      { id: user1Id, username: "johndoe" },
      { id: user2Id, username: "janedoe" },
      { id: user3Id, username: "alice" },
      { id: user4Id, username: "bob" },
    ]
  });

  await prisma.plantType.createMany({
    data: [
      { plant_type_name: "Succulent" },
      { plant_type_name: "Flower" },
      { plant_type_name: "Tree" },
      { plant_type_name: "Aromatic Herb" },
    ]
  });

  await prisma.plant.createMany({
    data: [
      {
        plant_name: "Aloe Vera",
        user_id: user1Id,
        plant_type_id: 1,
        photo: "aloe_vera.jpg",
      },
      {
        plant_name: "Red Rose",
        user_id: user2Id,
        plant_type_id: 2,
        photo: "rose_rouge.jpg",
      },
      { plant_name: "Chêne", user_id: user3Id, plant_type_id: 3, photo: "chene.jpg" },
      {
        plant_name: "Basil",
        user_id: user4Id,
        plant_type_id: 4,
        photo: "basilic.jpg",
      },
    ]
  });

  await prisma.event.createMany({
    data: [
      {
        title: "Water Aloe Vera",
        start: new Date("2025-04-13T10:00:00Z"),
        end: new Date("2025-04-13T11:00:00Z"),
        userId: user1Id,
        plantId: 1,
      },
      {
        title: "Fertilize Rose",
        start: new Date("2025-04-14T14:00:00Z"),
        end: new Date("2025-04-14T15:00:00Z"),
        userId: user2Id,
        plantId: 2,
      },
    ]
  });

  logger.info("Seeding complete");
}

seed()
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });