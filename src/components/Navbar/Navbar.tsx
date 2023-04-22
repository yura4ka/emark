import { Avatar, DarkThemeToggle, Dropdown, Navbar } from "flowbite-react";
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
          <Avatar placeholderInitials={formatName(session.user.name)} rounded={true} />
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
  return (first[0] || "") + (last[0] || "");
}

export default NavBar;
