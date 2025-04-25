import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  await prisma.user.createMany({
    data: [
      {
        username: "johndoe",
        email: "johndoe@example.com",
        password_hash: "hashed_password1",
      },
      {
        username: "janedoe",
        email: "janedoe@example.com",
        password_hash: "hashed_password2",
      },
      {
        username: "alice",
        email: "alice@example.com",
        password_hash: "hashed_password3",
      },
      {
        username: "bob",
        email: "bob@example.com",
        password_hash: "hashed_password4",
      },
    ]
  });

  await prisma.plantType.createMany({
    data: [
      { plant_type_name: "Succulente" },
      { plant_type_name: "Fleur" },
      { plant_type_name: "Arbre" },
      { plant_type_name: "Herbe Aromatique" },
    ]
  });

  await prisma.plant.createMany({
    data: [
      {
        plant_name: "Aloe Vera",
        user_id: 1,
        plant_type_id: 1,
        photo: "aloe_vera.jpg",
      },
      {
        plant_name: "Rose Rouge",
        user_id: 2,
        plant_type_id: 2,
        photo: "rose_rouge.jpg",
      },
      { plant_name: "Chêne", user_id: 3, plant_type_id: 3, photo: "chene.jpg" },
      {
        plant_name: "Basilic",
        user_id: 4,
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
        userId: 1,
        plantId: 1,
      },
      {
        title: "Fertilize Rose",
        start: new Date("2025-04-14T14:00:00Z"),
        end: new Date("2025-04-14T15:00:00Z"),
        userId: 2,
        plantId: 2,
      },
    ]
  });

  // Continue adding other data like posts, comments, likes, etc.

  console.log("Seeding complete");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
