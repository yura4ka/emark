import { Spinner, Tooltip } from "flowbite-react";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { HiArrowRight } from "react-icons/hi";

const Home: NextPage = () => {
  const session = useSession();
  const isStudent =
    session.status === "authenticated" &&
    session.data.user.role.isStudent &&
    session.data.user.isConfirmed;

  const { data, isLoading } = api.student.getMarksFull.useQuery(undefined, {
    enabled: isStudent,
  });

  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(true);
    return () => setIsBrowser(false);
  }, []);

  const { chartData, rows } = useMemo(() => {
    const chartData: { avg: number; subject: string; color: string; rounded: number }[] =
      [];
    const rows: JSX.Element[] = [];

    if (!data) return { chartData, rows };

    const [subjects, marks] = data;
    for (const [sid, m] of data[1].entries()) {
      const avg =
        m.reduce((acc, current) => acc + (current.score / current.maxScore) * 100, 0) /
        m.length;
      chartData.push({
        subject: data[0].get(sid) || "",
        avg,
        rounded: Math.round(avg),
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      });
    }

    for (const [sid, name] of subjects.entries()) {
      rows.push(
        <tr key={sid} className="hover:bg-gray-50">
          <td className="min-w-max whitespace-nowrap border p-1 px-2">{name}</td>
          {marks.get(sid)?.map((m) => (
            <td key={m.id} className="cell-tooltip h-9 w-9 border p-0 hover:bg-gray-100">
              <Tooltip
                animation="duration-1000"
                content={
                  <div className="p-1">
                    <p className="mb-2 text-2xl font-bold tracking-tight">
                      {m.title || m.date.toLocaleDateString()}
                    </p>
                    <p className="mb-2 text-sm font-normal">
                      Оцінка: {m.score}/{m.maxScore}
                    </p>
                    {m.comment && (
                      <p className="text-sm font-light">Коментар: {m.comment}</p>
                    )}
                  </div>
                }
              >
                {m.score}
              </Tooltip>
            </td>
          ))}
        </tr>
      );
    }

    return { chartData, rows };
  }, [data]);

  if ((isStudent && isLoading) || !isBrowser || session.status === "loading")
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  return (
    <>
      <Head>
        <title>Emark</title>
      </Head>
      {isStudent ? (
        <>
          <h1 className="mb-6 text-3xl font-bold">Оцінки</h1>
          <table className="text-lg">
            <tbody>{rows}</tbody>
          </table>
          <div className="my-10">
            <h3 className="my-6 p-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Статистика:
            </h3>
            <ResponsiveContainer height={250}>
              <BarChart width={730} height={250} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" interval={0} />
                <YAxis />
                <Bar dataKey="avg" barSize={20}>
                  {chartData.map((entry, index) => (
                    <>
                      <Cell key={index} fill={entry.color} />
                      <LabelList dataKey="rounded" position="top" />
                    </>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="my-10 flex flex-col items-center justify-center text-center">
          <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            Зручний застосунок для студентів і викладачів
          </h1>
          <p className="mb-6 text-lg font-normal text-gray-500 dark:text-gray-400 sm:px-16 lg:text-xl xl:px-48">
            Електронний журнал оцінок для університету, що має багато зручних функцій.
            Ставте оцінку в один клік. Аналізуйте процес навчання завдяки автоматичному
            веденню статистки.
          </p>
          <div className="flex gap-5">
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-center text-base font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
            >
              Увійти
            </Link>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-center text-base font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
            >
              Зареєструватися
              <HiArrowRight className="ml-2 -mr-1 h-5 w-5" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
