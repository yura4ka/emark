import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
export function useUserSession() {
  const session = useSession({ required: true });
  const { push } = useRouter();

  if (session.status === "authenticated" && !session.data.user.isConfirmed)
    void push("/");

  return session.data?.user;
}
