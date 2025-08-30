import Image from "next/image";
import Icon from "@components/common/Icon";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabaseServer";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col items-center px-4 pt-24 pb-6 bg-[#05131A] min-h-screen text-white">
      {/* Authentication check and user info */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">
          Welcome back,{" "}
          {user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Plant Parent"}
          !
        </h1>
        <p className="text-gray-300 text-sm">{user.email}</p>
        <p className="text-gray-400 text-xs mt-1">
          Member since {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Profile picture */}
      <div className="w-64 h-64 bg-white rounded-xl overflow-hidden flex items-center justify-center mb-6">
        <Image
          src="/images/unknown-plant.jpg"
          alt="Profile picture"
          width={256}
          height={256}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Cards */}
      <div className="w-full max-w-sm">
        <Link href="/myplants">
          <div className="flex items-center justify-between bg-white rounded-xl p-4 text-black shadow hover:bg-gray-100 transition-colors mb-4">
            <div>
              <h2 className="font-bold text-lg">My plants</h2>
              <p className="text-sm text-gray-600">Your registered plants</p>
            </div>
            <Icon name="buttonPlant" size={55} />
          </div>
        </Link>

        <Link href="/myfeed">
          <div className="flex items-center justify-between bg-white rounded-xl p-4 text-black shadow hover:bg-gray-100 transition-colors mb-4">
            <div>
              <h2 className="font-bold text-lg">My feed</h2>
              <p className="text-sm text-gray-600">See all your posts</p>
            </div>
            <Icon name="buttonFeed" size={55} />
          </div>
        </Link>

        <Link href="/calendar">
          <div className="flex items-center justify-between bg-white rounded-xl p-4 text-black shadow hover:bg-gray-100 transition-colors">
            <div>
              <h2 className="font-bold text-lg">My calendar</h2>
              <p className="text-sm text-gray-600">Check your schedule</p>
            </div>
            <Icon name="buttonCalendar" size={55} />
          </div>
        </Link>
      </div>
    </div>
  );
}
