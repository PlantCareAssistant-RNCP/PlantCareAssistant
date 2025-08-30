import Image from "next/image";
import { useState } from "react";

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
}: MyPlantCardProps) {
  const [imageError, setImageError] = useState(false);

  const getImageSrc = (url: string) => {
    if (!url) return '/default-plant.jpg';
    if (url.startsWith('http') || url.startsWith('/')) return url;
    return `/${url}`;
  };

  const handleImageError = () => {
    console.log(`Failed to load image: ${imageUrl}`); // Debug log
    setImageError(true);
  };

  return (
    <div
      className="bg-[#E8E8E8] flex rounded-xl shadow-md overflow-hidden h-24 transition hover:scale-[1.01]"
    >
      <div className="w-24 h-full relative bg-gray-300">
        {!imageError ? (
          <Image
            src={getImageSrc(imageUrl)}
            alt={name}
            fill
            className="object-cover rounded-l-xl"
            onError={handleImageError}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx4f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7+i6wxTEiQQQa1cg/KVogMaytTaNHhgz7KxJoAG2BUBAu4qOo8E0u2G/i1x8HQGmPB/MjhWXVZB6I6NYJ1/lh8Lxe4d4k9o8MyOGJlJPy6RV5Gx9o3q4JhlySd5ddVEo8DRKFaqnGePUE+GLoq0WMp1tH/AKEgb7ZZV44zAWwDJFCGN9iQdJgwLfW1rEKCtOVKlSSKJ5GAr5xWWEaxmO7T1Drc8Kls93kVlPeJzAOh7k1pzFdw8J5Pg3iQl++HzVpg+JUB0mYfLV8m0dNVUKGSy/2NwOCJwL1LT2gWJcFTx+/qrlIXqOdLzx0vb+xKJNgClEj5DByNVRj8AWkLadqOTMmQdKqF0wLdFUZoB2QC3BKjQXESDp8qHCG5BjnXHBo1AHONaYRQQ6SJxF5EM0a6zxrQNEjUEhOT3qzgdJLwBl8I8MaG8QKfEL+8zOqLfBJnH9ogA2u8CdLGGLfGLRMOLdAOdJe2Q/KVH0D2vTj/AOKHLRJZfcPj/aF1J/n7u8ykQ="
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 rounded-l-xl">
            <span className="text-gray-500 text-xs text-center">No Image</span>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center px-4">
        <h3 className="text-md font-bold text-black">{name}</h3>
        <p className="text-sm italic text-gray-500">{species}</p>
      </div>
    </div>
  );
}
