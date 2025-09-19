import FeedCard from "./FeedCard";
import Link from "next/link";

export const dummyPosts = [
  {
    id: 1,
    authorId: "1",
    username: "Jane Doe",
    description:
      "Ma monstera pousse super vite depuis que je l'ai rapprochée de la lumière naturelle 🌿",
    imageUrl: "/images/monstera.jpg",
    commentsCount: 7,
    date: "2023-10-01",
    comments: [
      {
        id: 1,
        username: "Lucie",
        text: "Superbe plante ! J'adore les monstera !",
        date: "2023-10-01",
        time: "10:15",
      },
      {
        id: 2,
        username: "Marc",
        text: "Quelle taille fait-elle maintenant ?",
        date: "2023-10-01",
        time: "11:20",
      },
      {
        id: 3,
        username: "Sophie",
        text: "J'ai la même, elles sont géniales !",
        date: "2023-10-01",
        time: "14:05",
      },
      {
        id: 4,
        username: "Nico",
        text: "Tu as essayé de la tailler ?",
        date: "2023-10-01",
        time: "16:42",
      },
      {
        id: 5,
        username: "Alice",
        text: "J'adore les feuilles de monstera, elles sont si graphiques !",
        date: "2023-10-01",
        time: "18:30",
      },
      {
        id: 6,
        username: "Tom",
        text: "J'ai entendu dire qu'elles aiment l'humidité, tu fais quelque chose de spécial ?",
        date: "2023-10-01",
        time: "20:15",
      },
      {
        id: 7,
        username: "Emma",
        text: "J'ai lu qu'elles peuvent vivre très longtemps, c'est vrai ?",
        date: "2023-10-01",
        time: "21:00",
      },
    ],
  },
  {
    id: 2,
    authorId: "2",
    username: "Alex Green",
    description:
      "Petite update : j’ai enfin rempoté mon pilea, et il a l’air ravi 💚",
    imageUrl: "/images/pilea.jpg",
    commentsCount: 2,
    date: "2023-10-02",
    comments: [
      {
        id: 1,
        username: "Camille",
        text: "Il a l'air en pleine forme !",
        date: "2023-10-02",
        time: "09:30",
      },
      {
        id: 2,
        username: "Émilie",
        text: "J'adore les pilea, ils sont si faciles à entretenir !",
        date: "2023-10-02",
        time: "10:12",
      },
    ],
  },
  {
    id: 3,
    authorId: "3",
    username: "Flora B.",
    description:
      "Quelqu’un connaît cette plante ? Je l’ai récupérée dans une brocante, aucune idée de son nom 😅",
    imageUrl: "/images/unknown-plant.jpg",
    commentsCount: 3,
    date: "2023-10-03",
    comments: [
      {
        id: 1,
        username: "Antoine",
        text: "Ça ressemble à une plante ZZ !",
        date: "2023-10-03",
        time: "08:50",
      },
      {
        id: 2,
        username: "Sabrina",
        text: "Peut-être un pothos ?",
        date: "2023-10-03",
        time: "09:15",
      },
      {
        id: 3,
        username: "Julien",
        text: "Je pense que c'est une sansevieria !",
        date: "2023-10-03",
        time: "10:05",
      },
    ],
  },
  {
    id: 4,
    authorId: "4",
    username: "Marco Plantlover",
    description:
      "Le ficus elastica de mes rêves 🌱 Il était en solde, je n’ai pas pu résister !",
    imageUrl: "/images/ficus.jpg",
    commentsCount: 2,
    date: "2023-10-04",
    comments: [
      {
        id: 1,
        username: "Claire",
        text: "Il est magnifique !",
        date: "2023-10-04",
        time: "12:45",
      },
      {
        id: 2,
        username: "David",
        text: "J'adore les ficus, ils sont si élégants !",
        date: "2023-10-04",
        time: "13:30",
      },
    ],
  },
  {
    id: 5,
    authorId: "5",
    username: "John Doe",
    description: "Mon aloe vera a enfin fleuri, je suis tellement content ! 🌸",
    imageUrl: "/images/aloe-vera.jpg",
    commentsCount: 3,
    date: "2023-10-05",
    comments: [
      {
        id: 1,
        username: "Sophie",
        text: "C'est rare de voir un aloe vera fleurir, bravo !",
        date: "2023-10-05",
        time: "09:00",
      },
      {
        id: 2,
        username: "Marc",
        text: "Tu fais quelque chose de spécial pour qu'il fleurisse ?",
        date: "2023-10-05",
        time: "10:15",
      },
      {
        id: 3,
        username: "Emma",
        text: "Magnifique ! Ça doit être gratifiant de le voir fleurir.",
        date: "2023-10-05",
        time: "11:30",
      },
    ],
  },
  {
    id: 6,
    authorId: "6",
    username: "John Doe",
    description: "J’ai essayé de bouturer mon pothos, croisons les doigts 🤞",
    imageUrl: "/images/pothos.jpg",
    commentsCount: 2,
    date: "2023-10-06",
    comments: [
      {
        id: 1,
        username: "Lucie",
        text: "Les pothos sont super faciles à bouturer, ça va marcher !",
        date: "2023-10-06",
        time: "08:45",
      },
      {
        id: 2,
        username: "Antoine",
        text: "Hâte de voir le résultat, tiens-nous au courant !",
        date: "2023-10-06",
        time: "09:20",
      },
    ],
  },
];

export default function FeedList() {
	return (
		<div className="space-y-4 mt-8">
			{dummyPosts.map((post) => (
				<div key={post.id}>
					<Link
						href={`/post/${post.id}`}
						aria-label={`Ouvrir la publication ${post.id} de ${post.username}`}
						className="block"
					>
						<FeedCard
							id={post.id}
							authorId={post.authorId}
							username={post.username}
							description={post.description}
							imageUrl={post.imageUrl}
							commentsCount={post.commentsCount}
							date={post.date}
						/>
					</Link>
				</div>
			))}
		</div>
	);
}
