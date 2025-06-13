// components/Feed/FeedList.tsx

import FeedCard from './FeedCard';

const dummyPosts = [
    {
      username: "Jane Doe",
      description: "Ma monstera pousse super vite depuis que je l'ai rapprochée de la lumière naturelle 🌿",
      imageUrl: "/images/monstera.jpg",
      commentsCount: 12,
    },
    {
      username: "Alex Green",
      description: "Petite update : j’ai enfin rempoté mon pilea, et il a l’air ravi 💚",
      imageUrl: "/images/pilea.jpg",
      commentsCount: 8,
    },
    {
      username: "Flora B.",
      description: "Quelqu’un connaît cette plante ? Je l’ai récupérée dans une brocante, aucune idée de son nom 😅",
      imageUrl: "/images/unknown-plant.jpg",
      commentsCount: 5,
    },
    {
      username: "Marco Plantlover",
      description: "Le ficus elastica de mes rêves 🌱 Il était en solde, je n’ai pas pu résister !",
      imageUrl: "/images/ficus.jpg",
      commentsCount: 17,
    },
  ];
  

export default function FeedList() {
  return (
    <div className="space-y-6">
      {dummyPosts.map((post, idx) => (
        <FeedCard key={idx} {...post} />
      ))}
    </div>
  );
}
