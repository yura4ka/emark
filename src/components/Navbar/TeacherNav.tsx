import { Navbar } from "flowbite-react";
import type { User } from "next-auth";
import { TeacherRoutes } from "../../utils/routes";
import RouteLinks from "./RouteLinks";

const TeacherNav = ({ user }: { user: User }) => {
  return (
    <>
      <RouteLinks routes={TeacherRoutes.basic} />
      {user.isTeacher && <span>Test t</span>}
    </>
  );
};

export default TeacherNav;
