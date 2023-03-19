import type { NextPageWithLayout } from "../_app";
import Head from "next/head";
import { Spinner } from "flowbite-react";
import { useRouter } from "next/router";
import { useUserSession } from "../../hooks/useUserSession";
import { api } from "../../utils/api";
import TeacherClass from "../../components/Teacher/TeacherClass";

const Subject: NextPageWithLayout = () => {
  const user = useUserSession();
  const isTeacher = user?.role.isTeacher || false;
  const isStudent = user?.role.isStudent || false;

  const router = useRouter();
  const id = +(router.query.id || -1) || -1;

  const { data } = api.class.getById.useQuery(id, {
    enabled: id > 0 && !!user,
  });

  if (!user || !data)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  return (
    <>
      <Head>
        <title>{data.name}</title>
      </Head>

      {isTeacher && <TeacherClass classId={id} title={data.name} />}
      {isStudent && (
        <>
          <h1 className="mb-6 text-3xl font-bold">{data.name}</h1>
        </>
      )}
    </>
  );
};

Subject.getLayout = function getLayout(page) {
  return page;
};

export default Subject;
