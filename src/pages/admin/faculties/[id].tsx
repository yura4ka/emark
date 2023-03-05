import { Spinner } from "flowbite-react";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { getServerAuthSession } from "../../../server/auth";
import { api } from "../../../utils/api";
import Head from "next/head";
import DataTable, { createTableProps } from "../../../components/DataTable/DataTable";
import { useMemo } from "react";
import Link from "next/link";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);
  if (!session?.user.role.isAdmin)
    return { redirect: { destination: "/", permanent: false } };
  return { props: { user: session.user } };
};

const Faculty: NextPage = () => {
  const router = useRouter();
  const id = +(router.query.id || -1);
  const { data: faculty } = api.faculty.getById.useQuery(id);
  const { isLoading, data } = api.faculty.getGroupsFull.useQuery(id);
  const changeGroup = api.group.edit.useMutation();
  const createGroup = api.group.create.useMutation();
  const apiUtils = api.useContext();

  const groupsData = useMemo(
    () =>
      data?.map((d) => ({
        id: d.id,
        name: d.name,
        handler: d.handler?.name || "-",
        senior: d.senior?.name || "-",
        seniorId: d.senior?.id || -1,
        count: d.students.length || "0",
      })),
    [data]
  );

  const tableProps = createTableProps({
    data: groupsData || [],
    columnDefinitions: [
      {
        header: "Назва",
        key: "name",
        editType: "text",
        isUnique: true,
        errorMessages: { CONFLICT: "Група з такою назвою вже існує!" },
        customElement: (row) => (
          <Link href={`groups/${row.id}`} className="hover:underline">
            {row.name}
          </Link>
        ),
      },
      {
        header: "Куратор",
        key: "handler",
        editType: "select",
      },
      {
        header: "Староста",
        key: "senior",
        idKey: "seniorId",
        editType: "select",
        changeOptions: (r) =>
          data
            ?.find((d) => d.id === r.id)
            ?.students.map((s) => ({ id: s.id, option: s.name })) || [],
      },
      { header: "Кількість учнів", key: "count" },
    ],
    options: {
      header: faculty?.title || "",
      showActions: true,
      canEdit: true,
      defaultRow: {
        id: -1,
        name: "",
        handler: "-",
        senior: "-",
        seniorId: -1,
        count: 0,
      },
    },
    onRowChange: ({ newRow, setLoading, setValidation, ids }) => {
      const name = newRow.name.trim();
      const { id } = newRow;
      setLoading(true);
      changeGroup.mutate(
        { id, name, seniorId: ids.senior },
        {
          onError(error) {
            if (error.data?.code === "CONFLICT") setValidation({ title: "CONFLICT" });
            else void apiUtils.faculty.getGroupsFull.invalidate(faculty?.id);
            setLoading(false);
          },
          onSuccess() {
            apiUtils.faculty.getGroupsFull.setData(faculty?.id || -1, (old) =>
              old
                ? old.map((f) =>
                    f.id === id
                      ? { ...f, name, senior: { id: ids.senior, name: newRow.senior } }
                      : f
                  )
                : old
            );
            setLoading(false);
          },
        }
      );
    },
    onNewRowCreate: ({ newRow: row, setLoading, setValidation }) => {
      setLoading(true);
      createGroup.mutate(
        { name: row.name.trim(), facultyId: faculty?.id || -1 },
        {
          onError(error) {
            if (error.data?.code === "CONFLICT") setValidation({ title: "CONFLICT" });
            else void apiUtils.faculty.getGroupsFull.invalidate();
            setLoading(false);
          },
          onSuccess() {
            setLoading(false);
            void apiUtils.faculty.getGroupsFull.invalidate(faculty?.id);
          },
        }
      );
    },
  });

  if (isLoading || !data)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  return (
    <>
      <Head>
        <title>{faculty?.title}</title>
      </Head>
      <DataTable {...tableProps} />
    </>
  );
};

export default Faculty;
