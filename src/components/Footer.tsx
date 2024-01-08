import { Footer } from "flowbite-react";
import type { NextComponentType } from "next";
import { BsTelegram, BsGithub, BsAt } from "react-icons/bs";

export const PageFooter: NextComponentType = () => {
  return (
    <Footer
      container={true}
      className="rounded-none border-t border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="w-full sm:flex sm:items-center sm:justify-between">
        <Footer.Copyright href="#" by="Emark™" year={new Date().getFullYear()} />
        <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
          <Footer.Icon href="mailto:emark@gmx.us" icon={BsAt} />
          <Footer.Icon href="#" icon={BsTelegram} />
          <Footer.Icon href="https://github.com/yura4ka/emark" icon={BsGithub} />
        </div>
      </div>
    </Footer>
  );
};
