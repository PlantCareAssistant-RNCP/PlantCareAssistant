import Image from "next/image";
import Icon from "@components/common/Icon";

export interface FeedCardProps {
  id: number;
  authorId: string;
  username: string;
  description: string;
  imageUrl: string;
  commentsCount: number;
  date: string;
}

export default function FeedCard({
  username,
  description,
  imageUrl,
  commentsCount,
  date,
}: FeedCardProps) {
  return (
    <div className="bg-[#E8E8E8] text-black rounded-xl shadow-md overflow-hidden space-y-2 p-3">
      <div className="w-full h-48 rounded-md overflow-hidden relative">
        <Image
          src={imageUrl}
          alt={`Post by ${username}`}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex justify-between items-center text-sm font-semibold">
        <span>{username}</span>
        <span className="text-xs text-black">{date}</span>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      <div className="flex items-center text-sm text-gray-500 gap-1">
        <Icon name="commentBlack" size={20} className="text-gray-500" />
        <span>{commentsCount}</span>
      </div>
    </div>
  );
}
