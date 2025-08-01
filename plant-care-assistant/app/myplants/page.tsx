'use client';

import Link from "next/link";
import Icon from "@components/common/Icon";
import MyPlantCard from "@components/features/myplants/PlantCard";
import { dummyPlants } from "@components/features/myplants/MockPlant";

export default function MyPlants() {
  return (
    <>
      <Link href="/dashboard" className="fixed top-15 left-2 z-50 p-2 pt-20">
        <Icon name="backIcon" size={50} />
      </Link>

      <div className="max-w-md mx-auto pt-40 px-4 space-y-4">
        <h1 className="text-white text-lg font-semibold">My plant library</h1>

        {dummyPlants.map((plant, idx) => (
          <Link
            href={`/plants/${plant.id}`}
            key={plant.id}
            className="block" // important pour le spacing
          >
            <MyPlantCard
              name={plant.name}
              species={plant.description}
              imageUrl={plant.imageUrl}
              isSelected={idx === 1} // exemple
            />
          </Link>
        ))}
      </div>

      <Link href="/createplant">
        <div className="fixed bottom-20 right-6 z-[9999]">
          <Icon name="buttonAddPost" size={70} />
        </div>
      </Link>
    </>
  );
}
