import Image from "next/image";
import Icon from "@components/common/Icon";
import Link from "next/link";

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
  id,
  username,
  description,
  imageUrl,
  commentsCount,
  date,
}: FeedCardProps) {
  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      role="article"
      aria-label={`Post by ${username}`}
      className="bg-[#E8E8E8] text-black rounded-xl shadow-md overflow-hidden space-y-2 p-3"
    >
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
        <time dateTime={date} className="text-xs text-black">
          {formatDate(date)}
        </time>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      <div className="flex items-center text-sm text-gray-500 gap-1">
        <Icon name="commentBlack" size={20} aria-hidden="true" className="text-gray-500" />
        <span>{commentsCount}</span>
      </div>
    </div>
  );
}
