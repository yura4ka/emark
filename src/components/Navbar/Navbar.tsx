import { DarkThemeToggle, Navbar } from "flowbite-react";
import type { Session, User } from "next-auth";
import StudentNav from "./StudentNav";
import TeacherNav from "./TeacherNav";
import { UserRoutes } from "../../utils/routes";
import RouteLinks from "./RouteLinks";
import { useSession, signOut } from "next-auth/react";
import { HiLogout } from "react-icons/hi";

const NavBar = () => {
  const { data: session, status } = useSession();

  return (
    <>
      <Navbar
        fluid={true}
        rounded={false}
        theme={{
          inner: {
            base: "mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between",
          },
        }}
      >
        <Navbar.Toggle />
        <Navbar.Brand href="/">
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Emark
          </span>
        </Navbar.Brand>
        <DarkThemeToggle className="md:hidden" />
        <Navbar.Collapse
          theme={{
            list: "mt-4 flex flex-col md:mt-0 md:flex-row md:space-x-8 md:text-sm md:font-medium md:items-center",
          }}
        >
          <RouteLinks routes={UserRoutes.basic} />
          {status !== "loading" && <SessionNav session={session} />}
          <DarkThemeToggle className="hidden md:block" />
        </Navbar.Collapse>
      </Navbar>
    </>
  );
};

function UserNav({ user }: { user: User }) {
  if (user.role.isTeacher) return <TeacherNav user={user} />;
  else if (user.role.isStudent) return <StudentNav user={user} />;
  return <></>;
}

function SessionNav({ session }: { session: Session | null }) {
  if (!session) return <RouteLinks routes={UserRoutes.unauthorized} />;
  return (
    <>
      <UserNav user={session.user} />
      <button
        onClick={() => void signOut()}
        className="flex items-center py-2 pr-4 pl-3 text-black hover:text-red-600 dark:text-gray-400  hover:dark:text-red-500 md:bg-transparent md:p-0"
      >
        Вийти
        <HiLogout className="ml-2 h-5 w-5" />
      </button>
    </>
  );
}

export default NavBar;
