import type { NextPage } from "next";
import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi";

const Custom404: NextPage = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex h-96 w-[40rem] flex-col items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-center shadow dark:border-gray-700 dark:bg-gray-800 sm:p-8">
        <h5 className="text-3xl font-bold text-gray-900 dark:text-white">
          404 Сторінка не знайдена :{"("}
        </h5>
        <p className="mb-4 text-base text-gray-500 dark:text-gray-400 sm:text-lg">
          Перевірте коректність адреси
        </p>
        <div className="items-center justify-center space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
          <Link
            href="/"
            className="group flex h-min w-fit items-center justify-center rounded-lg border border-transparent bg-blue-700 p-0.5 text-center font-medium text-white hover:bg-blue-800 focus:z-10 focus:ring-4 focus:ring-blue-300 disabled:hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900 dark:disabled:hover:bg-blue-600"
          >
            <span className="flex items-center rounded-md px-5 py-2.5 text-base">
              На головну
              <HiOutlineArrowRight className="ml-2 h-6 w-5" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Custom404;
