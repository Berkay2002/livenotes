import { liveblocks } from "@/lib/liveblocks";
import { getUserColor } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function POST() {
  const clerkUser = await currentUser();

  if(!clerkUser) {
    return redirect('/sign-in');
  }

  const user = {
    id: clerkUser.id,
    info: {
        id: clerkUser.id,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        avatar: clerkUser.imageUrl || '',
        color: getUserColor(clerkUser.id),
    },
  }

  // Identify the user and return the result
  const { status, body } = await liveblocks.identifyUser(
    {
      userId: user.info.email,
      groupIds: [],
    },
    { userInfo: user.info },
  );

  return new Response(body, { status });
}