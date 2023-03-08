import { Spinner } from "flowbite-react";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { getServerAuthSession } from "../../../server/auth";
import { api } from "../../../utils/api";
import Head from "next/head";
import DataTable, { createTableProps } from "../../../components/DataTable/DataTable";
import { useMemo, useState } from "react";
import Link from "next/link";
import MyInput from "../../../components/Inputs/MyInput";
import CardButtons from "../../../components/Buttons/CardButtons";

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
  const changeFaculty = api.faculty.rename.useMutation();
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
          <Link href={`/admin/groups/${row.id}`} className="hover:underline">
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
      { header: "Кількість студентів", key: "count" },
    ],
    options: {
      header: "Групи",
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
    onRowChange: ({ newRow, setLoading, setValidation }) => {
      const name = newRow.name.trim();
      const groupId = newRow.id;
      setLoading(true);
      changeGroup.mutate(
        { id: groupId, name, seniorId: newRow.seniorId, facultyId: id },
        {
          onError(error) {
            if (error.data?.code === "CONFLICT") setValidation({ title: "CONFLICT" });
            else void apiUtils.faculty.getGroupsFull.invalidate(faculty?.id);
            setLoading(false);
          },
          onSuccess() {
            apiUtils.faculty.getGroupsFull.setData(faculty?.id || -1, (old) =>
              old
                ? old.map((g) =>
                    g.id === groupId
                      ? {
                          ...g,
                          name,
                          senior: { id: newRow.seniorId, name: newRow.senior },
                        }
                      : g
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

  const [name, setName] = useState(() => faculty?.title || "");
  const [isError, setIsError] = useState(false);
  const isChanged = name !== faculty?.title;

  if (isLoading || !data || !faculty)
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
      <h1 className="mb-6 text-3xl font-bold">{faculty?.title}</h1>
      <div className="my-6 flex max-w-xl flex-col gap-2">
        <MyInput
          label="Назва"
          value={name}
          setValue={(value) => {
            setName(value);
            setIsError(false);
          }}
          isValid={name.trim().length !== 0 && !isError}
        />
        {isChanged && (
          <CardButtons
            isError={isError}
            isLoading={changeFaculty.isLoading}
            isDisabled={name.trim().length === 0}
            errorMessage={"Факультет з такою назвою вже існує!"}
            onConfirm={() => {
              changeFaculty.mutate(
                { id, newName: name },
                {
                  onSuccess() {
                    void apiUtils.faculty.getById.invalidate(id);
                  },
                  onError() {
                    setIsError(true);
                  },
                }
              );
            }}
            onDiscard={() => {
              setName(faculty.title);
              setIsError(false);
            }}
          />
        )}
      </div>
      <DataTable {...tableProps} />
    </>
  );
};

export default Faculty;
