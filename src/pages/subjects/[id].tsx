import type { NextPageWithLayout } from "../_app";
import Head from "next/head";
import { Spinner } from "flowbite-react";
import { useRouter } from "next/router";
import { useUserSession } from "../../hooks";
import { api } from "../../utils/api";
import { TeacherClass, StudentClass } from "../../components";

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

      {isTeacher && <TeacherClass classId={id} title={data.name} info={data} />}
      {isStudent && <StudentClass classId={id} title={data.name} />}
    </>
  );
};

Subject.getLayout = function getLayout(page) {
  return page;
};

export default Subject;
