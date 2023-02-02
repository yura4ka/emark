import type { User } from "next-auth";
import { StudentRoutes } from "../../utils/routes";
import RouteLinks from "./RouteLinks";

const StudentNav = ({ user }: { user: User }) => {
  return (
    <>
      <RouteLinks routes={StudentRoutes.basic} />
      {!user.isTeacher && <span>Test 2</span>}
    </>
  );
};

export default StudentNav;
