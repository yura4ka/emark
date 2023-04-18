import { DarkThemeToggle, Dropdown, Navbar } from "flowbite-react";
import type { Session, User } from "next-auth";
import StudentNav from "./StudentNav";
import TeacherNav from "./TeacherNav";
import { UserRoutes } from "../../utils/routes";
import RouteLinks from "./RouteLinks";
import { useSession, signOut } from "next-auth/react";
import { HiLogout, HiCog } from "react-icons/hi";
import Link from "next/link";

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
      <Dropdown
        label={
          <div className="flex items-center rounded-full text-sm font-medium text-gray-900 hover:text-blue-600 focus:ring-4 focus:ring-gray-100 dark:text-white dark:hover:text-blue-500 dark:focus:ring-gray-700 md:mr-0">
            <span className="sr-only">Open user menu</span>
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-lime-900 text-slate-100">
              {formatName(session.user.name)}
            </div>
          </div>
        }
        inline={true}
        arrowIcon={false}
      >
        <Dropdown.Header>
          <div>{session.user.name}</div>
          <div className="truncate font-medium">{session.user.email}</div>
        </Dropdown.Header>
        <Link href="/settings">
          <Dropdown.Item icon={HiCog}>Налаштування</Dropdown.Item>
        </Link>
        <Dropdown.Item icon={HiLogout} onClick={() => void signOut()}>
          Вийти
        </Dropdown.Item>
      </Dropdown>
    </>
  );
}

function formatName(name: string) {
  const words = name.split(" ");
  if (words.length < 2) return name[0];
  const first = words[0] || "";
  const last = words[1] || "";
  return first[0] || "" + (last[0] || "");
}

export default NavBar;
