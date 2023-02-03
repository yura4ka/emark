import { HiOutlineArrowRight } from "react-icons/hi";
import Link from "next/link";

const Error = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="max-w-lg rounded-lg border border-gray-200 bg-white p-10 pb-8 shadow dark:border-gray-700 dark:bg-gray-800">
        <h5 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Ваш акаунт не підтверджено
        </h5>

        <p className="mb-6 text-lg font-normal text-gray-700 dark:text-gray-400">
          Зверніться до старости вашої групи, для підтвердження акаунта, або, у
          разі помилки, сповістіть адміністратора.
        </p>
        <Link
          href="/"
          className="group flex h-min w-fit items-center justify-center rounded-lg border border-transparent bg-red-700 p-0.5 text-center font-medium text-white hover:bg-red-800 focus:z-10 focus:ring-4 focus:ring-red-300 disabled:hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900 dark:disabled:hover:bg-red-600"
        >
          <span className="flex items-center rounded-md px-5 py-2.5 text-base">
            На головну
            <HiOutlineArrowRight className="ml-2 h-5 w-5" />
          </span>
        </Link>
      </div>
    </div>
  );
};
export default Error;
