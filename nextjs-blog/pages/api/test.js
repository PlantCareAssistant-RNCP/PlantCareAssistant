import { openDb } from "../../database/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const db = await openDb();
    const users = await db.all("SELECT * FROM USER");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users: ", error.message, error.stack);
    res
      .status(500)
      .json({ message: "Internal Server Error of doom", error: error.message });
  }
}

// export default function handler(req, res) {
//   res.status(200).json({ message: "Hello from Test!" });
// }
