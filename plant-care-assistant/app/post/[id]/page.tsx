// app/post/[id]/page.tsx
interface PostPageProps {
    params: {
      id: string;
    };
  }
  
  export default function PostPage({ params }: PostPageProps) {
    const { id } = params;
  
    return (
      <main className="p-4">
        <h1 className="text-xl font-bold mb-4">Post #{id}</h1>
        <p>Post content WORK IN PROGRESS</p>
      </main>
    );
  }
  