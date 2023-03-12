import Link from "next/link";
import type { ComponentProps, FC, PropsWithChildren } from "react";
import { HiOutlineChevronRight } from "react-icons/hi";

export const Breadcrumb: FC<ComponentProps<"nav">> = ({ children, ...props }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb" {...props}>
      <ol className="inline-flex items-center">{children}</ol>
    </nav>
  );
};

interface BreadcrumbItemProps extends PropsWithChildren<ComponentProps<"li">> {
  href?: string;
  icon?: FC<ComponentProps<"svg">>;
}

export const BreadcrumbItem = ({ href, icon: Icon, children }: BreadcrumbItemProps) => {
  return (
    <li className="group inline-flex items-center">
      <HiOutlineChevronRight className="mx-1 h-6 w-6 text-gray-400 group-first:hidden md:mx-2" />
      {href ? (
        <Link
          href={href}
          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          {children}
        </Link>
      ) : (
        <span className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          {children}
        </span>
      )}
    </li>
  );
};
