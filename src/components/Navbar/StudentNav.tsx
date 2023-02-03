import type { User } from "next-auth";
import { StudentRoutes } from "../../utils/routes";
import RouteLinks from "./RouteLinks";

const StudentNav = ({ user }: { user: User }) => {
  return (
    <>
      <RouteLinks routes={StudentRoutes.basic} />
      {!user.isTeacher && <RouteLinks routes={StudentRoutes.senior} />}
    </>
  );
};

export default StudentNav;
