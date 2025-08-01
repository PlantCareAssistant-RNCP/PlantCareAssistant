import Image from "next/image";

interface MyPlantCardProps {
  name: string;
  species: string;
  imageUrl: string;
  isSelected?: boolean;
}

export default function MyPlantCard({
  name,
  species,
  imageUrl,
  isSelected = false,
}: MyPlantCardProps) {
  return (
    <div
      className="bg-[#E8E8E8] flex rounded-xl shadow-md overflow-hidden h-24 transition hover:scale-[1.01]"
    >
      <div className="w-24 h-full relative">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover rounded-l-xl"
        />
      </div>

      <div className="flex flex-col justify-center px-4">
        <h3 className="text-md font-bold text-black">{name}</h3>
        <p className="text-sm italic text-gray-500">{species}</p>
      </div>
    </div>
  );
}
