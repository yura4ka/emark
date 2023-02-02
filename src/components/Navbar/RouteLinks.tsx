import { Navbar } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { NavRoute } from "../../utils/routes";

const RouteLinks = ({ routes }: { routes: NavRoute[] }) => {
  const { pathname } = useRouter();

  return (
    <>
      {routes.map((r) => (
        <Navbar.Link
          as={Link}
          key={r.path}
          href={r.path}
          active={pathname === r.path}
        >
          {r.name}
        </Navbar.Link>
      ))}
    </>
  );
};

export default RouteLinks;
