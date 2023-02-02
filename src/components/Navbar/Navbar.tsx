import { DarkThemeToggle, Navbar } from "flowbite-react";
import type { Session, User } from "next-auth";
import StudentNav from "./StudentNav";
import TeacherNav from "./TeacherNav";
import { UserRoutes } from "../../utils/routes";
import RouteLinks from "./RouteLinks";

type NavBarType = {
  session: Session | null;
};

const NavBar = ({ session }: NavBarType) => {
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
          <SessionNav session={session} />
          <DarkThemeToggle className="hidden md:block" />
        </Navbar.Collapse>
      </Navbar>
    </>
  );
};

function UserNav({ user }: { user: User }) {
  if (user.isTeacher) return <TeacherNav user={user} />;
  return <StudentNav user={user} />;
}

function SessionNav({ session }: { session: Session | null }) {
  if (!session) return <RouteLinks routes={UserRoutes.unauthorized} />;
  return <UserNav user={session.user} />;
}

export default NavBar;
