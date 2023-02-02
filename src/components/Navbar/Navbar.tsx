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
        className="sticky top-0 z-40 mx-auto w-full flex-none"
      >
        <Navbar.Brand href="/">
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Emark
          </span>
        </Navbar.Brand>

        <div className="flex md:order-2">
          <Navbar.Toggle />
          <DarkThemeToggle />
        </div>
        <Navbar.Collapse>
          <RouteLinks routes={UserRoutes.basic} />
          <SessionNav session={session} />
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
