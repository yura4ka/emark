import { Spinner } from "flowbite-react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { TeacherSubjects, InfoAlert } from "../../components";
import { useUserSession } from "../../hooks";
import { api } from "../../utils/api";

const Subjects: NextPage = () => {
  const user = useUserSession();
  const isTeacher = user?.role.isTeacher || false;
  const isStudent = user?.role.isStudent || false;

  const studentClasses = api.student.getClasses.useQuery(user?.id || -1, {
    enabled: isStudent,
  });
  const teacherClasses = api.teacher.getClasses.useQuery(user?.id || -1, {
    enabled: isTeacher,
  });

  if (!user || !(studentClasses.data || teacherClasses.data))
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  return (
    <>
      <Head>
        <title>Предмети</title>
      </Head>

      <h1 className="mb-6 text-3xl font-bold">Предмети</h1>

      {teacherClasses.data && <TeacherSubjects data={teacherClasses.data} />}
      {studentClasses.data &&
        (studentClasses.data.length !== 0 ? (
          <ul className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">
            {studentClasses.data.map((c) => (
              <li
                key={c.id}
                className="py-3 px-1 transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-slate-800 sm:py-4"
              >
                <Link href={`subjects/${c.id}`}>
                  <div className="flex items-center space-x-4 px-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xl font-medium text-gray-900 dark:text-white">
                        {c.name}
                      </p>
                      <p className="truncate text-lg text-gray-500 dark:text-gray-400">
                        {c.teacher?.name || "TBA" + " - " + c.subject.title}
                      </p>
                    </div>
                    {c.tasks !== 0 && (
                      <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                        {c.tasks}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <InfoAlert text="Не знайдено жодного предмету." />
        ))}
    </>
  );
};

export default Subjects;
