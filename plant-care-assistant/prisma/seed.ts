import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import logger from "@utils/logger";

const prisma = new PrismaClient();

async function seed() {
  try {
    // Check if users already exist, if not create them
    let user1 = await prisma.userProfile.findUnique({
      where: { username: "johndoe" },
    });
    let user2 = await prisma.userProfile.findUnique({
      where: { username: "janedoe" },
    });
    let user3 = await prisma.userProfile.findUnique({
      where: { username: "alice" },
    });
    let user4 = await prisma.userProfile.findUnique({
      where: { username: "bob" },
    });

    if (!user1) {
      user1 = await prisma.userProfile.create({
        data: { id: randomUUID(), username: "johndoe" },
      });
    }
    if (!user2) {
      user2 = await prisma.userProfile.create({
        data: { id: randomUUID(), username: "janedoe" },
      });
    }
    if (!user3) {
      user3 = await prisma.userProfile.create({
        data: { id: randomUUID(), username: "alice" },
      });
    }
    if (!user4) {
      user4 = await prisma.userProfile.create({
        data: { id: randomUUID(), username: "bob" },
      });
    }

    // Check existing plant types to avoid duplicates
    const existingPlantTypes = await prisma.plantType.findMany();
    const existingTypeNames = existingPlantTypes.map((pt) =>
      pt.plant_type_name.toLowerCase()
    );

    const newPlantTypes = [
      "Succulent",
      "Flower",
      "Tree",
      "Aromatic Herb",
      "Cactus",
      "Fern",
      "Vine",
      "Houseplant",
      "Vegetable",
      "Fruit Tree",
      "Grass",
      "Moss",
      "Air Plant",
      "Aquatic Plant",
      "Bonsai",
    ].filter((name) => !existingTypeNames.includes(name.toLowerCase()));

    if (newPlantTypes.length > 0) {
      await prisma.plantType.createMany({
        data: newPlantTypes.map((name) => ({ plant_type_name: name })),
      });
      logger.info({
        message: `Added ${
          newPlantTypes.length
        } new plant types: ${newPlantTypes.join(", ")}`,
      });
    } else {
      logger.info({
        message: "All plant types already exist",
      });
    }

    // Only create plants if they don't exist
    const existingPlants = await prisma.plant.findMany();

    if (existingPlants.length === 0) {
      // Get plant type IDs for reference
      const succulentType = await prisma.plantType.findFirst({
        where: { plant_type_name: "Succulent" },
      });
      const flowerType = await prisma.plantType.findFirst({
        where: { plant_type_name: "Flower" },
      });
      const treeType = await prisma.plantType.findFirst({
        where: { plant_type_name: "Tree" },
      });
      const herbType = await prisma.plantType.findFirst({
        where: { plant_type_name: "Aromatic Herb" },
      });

      await prisma.plant.createMany({
        data: [
          {
            plant_name: "Aloe Vera",
            user_id: user1.id,
            plant_type_id: succulentType?.plant_type_id || 1,
            photo: "aloe_vera.jpg",
          },
          {
            plant_name: "Red Rose",
            user_id: user2.id,
            plant_type_id: flowerType?.plant_type_id || 2,
            photo: "rose_rouge.jpg",
          },
          {
            plant_name: "Chêne",
            user_id: user3.id,
            plant_type_id: treeType?.plant_type_id || 3,
            photo: "chene.jpg",
          },
          {
            plant_name: "Basil",
            user_id: user4.id,
            plant_type_id: herbType?.plant_type_id || 4,
            photo: "basilic.jpg",
          },
        ],
      });
      logger.info({
        message: "Sample plants created",
      });
    } else {
      logger.info({
        message: "Plants already exist, skipping plant creation",
      });
    }

    // Check if events exist
    const existingEvents = await prisma.event.findMany();
    if (existingEvents.length === 0) {
      const plants = await prisma.plant.findMany();
      if (plants.length >= 2) {
        await prisma.event.createMany({
          data: [
            {
              title: "Water Aloe Vera",
              start: new Date("2025-04-13T10:00:00Z"),
              end: new Date("2025-04-13T11:00:00Z"),
              userId: user1.id,
              plantId: plants[0].plant_id,
            },
            {
              title: "Fertilize Rose",
              start: new Date("2025-04-14T14:00:00Z"),
              end: new Date("2025-04-14T15:00:00Z"),
              userId: user2.id,
              plantId: plants[1].plant_id,
            },
          ],
        });
        logger.info({
          message: "Sample events created",
        });
      }
    } else {
      logger.info({
        message: "Events already exist, skipping event creation",
      });
    }

    logger.info({
      message: "Seeding complete",
    });
  } catch (error) {
    logger.error({
      message: "Seeding failed:",
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

seed()
  .catch((e) => {
    logger.error({
      message: "Seed error:",
      error: e instanceof Error ? e.message : String(e),
    });
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
