import { Dropdown } from "flowbite-react";
import type { User } from "next-auth";
import Link from "next/link";
import { TeacherRoutes } from "../../utils/routes";
import RouteLinks from "./RouteLinks";

const TeacherNav = ({ user }: { user: User }) => {
  return (
    <>
      <RouteLinks routes={TeacherRoutes.basic} />
      {user.role.isAdmin && (
        <Dropdown
          inline={true}
          label={
            <span className="rounded py-2 pl-3 pr-4 text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:border-0 md:p-0 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:bg-transparent md:dark:hover:text-white">
              Admin
            </span>
          }
        >
          {TeacherRoutes.admin.map((r) => (
            <Link key={r.path + r.name} href={r.path}>
              <Dropdown.Item>{r.name}</Dropdown.Item>
            </Link>
          ))}
        </Dropdown>
      )}
    </>
  );
};

export default TeacherNav;
