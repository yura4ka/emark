import { Spinner } from "flowbite-react";
import { type GetServerSidePropsContext, type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import DataTable, { createTableProps } from "../../components/DataTable/DataTable";
import { getServerAuthSession } from "../../server/auth";
import { api } from "../../utils/api";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);
  if (!session?.user.role.isAdmin)
    return { redirect: { destination: "/", permanent: false } };
  return { props: { user: session.user } };
};

const Faculties: NextPage = () => {
  const { isLoading, data: faculties } = api.faculty.get.useQuery();
  const renameFaculty = api.faculty.rename.useMutation();
  const createFaculty = api.faculty.create.useMutation();
  const apiUtils = api.useContext();

  const tableProps = createTableProps({
    data: faculties || [],
    options: {
      header: "Факультети",
      showActions: true,
      canEdit: true,
      defaultRow: { id: -1, title: "" },
    },
    columnDefinitions: [
      {
        header: "Назва",
        key: "title",
        editType: "text",
        validationFunction(row, newValue) {
          if (newValue.trim().length === 0) return false;
          return faculties?.some((f) => f.title === newValue.trim() && f.id !== row.id)
            ? "CONFLICT"
            : true;
        },
        errorMessages: { CONFLICT: "Факультет з таким іменем вже існує!" },
        customElement: (row) => (
          <Link href={`faculties/${row.id}`} className="hover:underline">
            {row.title}
          </Link>
        ),
      },
    ],
    onRowChange: ({ id, title }, setLoading, setValidation) => {
      title = title.trim();
      setLoading(true);
      renameFaculty.mutate(
        { id, newName: title },
        {
          onError(error) {
            if (error.data?.code === "CONFLICT") setValidation({ title: "CONFLICT" });
            else void apiUtils.faculty.get.invalidate();
            setLoading(false);
          },
          onSuccess() {
            apiUtils.faculty.get.setData(undefined, (old) =>
              old ? old.map((f) => (f.id === id ? { ...f, title } : f)) : old
            );
            setLoading(false);
          },
        }
      );
    },
    onNewRowCreate: (row, setLoading, setValidation) => {
      setLoading(true);
      createFaculty.mutate(row.title, {
        onError(error) {
          if (error.data?.code === "CONFLICT") setValidation({ title: "CONFLICT" });
          else void apiUtils.faculty.get.invalidate();
          setLoading(false);
        },
        onSuccess() {
          setLoading(false);
          void apiUtils.faculty.get.invalidate();
        },
      });
    },
  });

  if (isLoading || !faculties)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  return (
    <>
      <Head>
        <title>Факультети</title>
      </Head>
      <DataTable {...tableProps} />
    </>
  );
};
export default Faculties;
