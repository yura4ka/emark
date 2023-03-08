import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
export default function useAdminSession() {
  const { push } = useRouter();
  const session = useSession({ required: true, onUnauthenticated: () => void push("/") });
  if (session.status === "authenticated" && !session.data.user.role.isAdmin)
    void push("/");
}
