import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi";

const Custom404: NextPage = () => {
  return (
    <div className="h-full w-full">
      <Head>
        <title>Сторінка не знайдена</title>
      </Head>
      <div className="flex h-full flex-col items-center justify-center md:block md:py-36 md:px-16">
        <h1 className="pb-2 text-6xl font-black md:text-8xl">404.</h1>
        <p className="pb-4 text-2xl font-bold md:pb-8 md:text-4xl">
          Сторінка не знайдена :{"("}
        </p>
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
  );
};

export default Custom404;
