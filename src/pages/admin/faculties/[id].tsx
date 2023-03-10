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
import { formatOptional } from "../../../utils/utils";
import { Breadcrumb, BreadcrumbItem } from "../../../components/Breadcrumb";
import { HiCog } from "react-icons/hi";

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
  const { data: freeTeachers } = api.teacher.getFreeTeachers.useQuery();
  const apiUtils = api.useContext();

  const groupsData = useMemo(
    () =>
      data?.map((d) => ({
        id: d.id,
        name: d.name,
        handler: d.handler?.name || "-",
        handlerId: d.handler?.id || -1,
        senior: d.senior?.name || "-",
        seniorId: d.senior?.id || -1,
        count: d.students.length || "0",
      })),
    [data]
  );

  const freeTeachersOptions = useMemo(
    () => freeTeachers?.map((t) => ({ id: t.id, option: t.name })) || [],
    [freeTeachers]
  );

  const tableProps = createTableProps({
    data: groupsData || [],
    columnDefinitions: [
      {
        header: "??????????",
        key: "name",
        editType: "text",
        isUnique: true,
        errorMessages: { CONFLICT: "?????????? ?? ?????????? ???????????? ?????? ??????????!" },
        customElement: (row) => (
          <Link
            href={`/admin/groups/${row.id}?from=faculties`}
            className="hover:underline"
          >
            {row.name}
          </Link>
        ),
      },
      {
        header: "??????????????",
        key: "handler",
        editType: "select",
        changeOptions: (row) => {
          const option = { id: row.handlerId, option: row.handler };
          return option.id === -1
            ? freeTeachersOptions
            : [...freeTeachersOptions, option];
        },
        idKey: "handlerId",
        nullable: true,
      },
      {
        header: "????????????????",
        key: "senior",
        idKey: "seniorId",
        editType: "select",
        nullable: true,
        changeOptions: (r) =>
          data
            ?.find((d) => d.id === r.id)
            ?.students.map((s) => ({ id: s.id, option: s.name })) || [],
      },
      { header: "?????????????????? ??????????????????", key: "count" },
    ],
    options: {
      header: "??????????",
      showActions: true,
      canEdit: true,
      defaultRow: {
        id: -1,
        name: "",
        handler: "-",
        handlerId: -1,
        senior: "-",
        seniorId: -1,
        count: 0,
      },
    },
    onRowChange: ({ newRow, setLoading, setValidation }) => {
      const name = newRow.name.trim();
      const groupId = newRow.id;
      const handlerId = formatOptional(newRow.handlerId);
      const seniorId = formatOptional(newRow.seniorId);
      setLoading(true);
      changeGroup.mutate(
        { id: groupId, name, facultyId: id, seniorId, handlerId },
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
                          handler: { id: newRow.handlerId, name: newRow.handler },
                        }
                      : g
                  )
                : old
            );
            setLoading(false);
            void apiUtils.teacher.getFreeTeachers.invalidate();
          },
        }
      );
    },
    onNewRowCreate: ({ newRow: row, setLoading, setValidation }) => {
      setLoading(true);
      const handlerId = formatOptional(row.handlerId);
      createGroup.mutate(
        { name: row.name.trim(), facultyId: faculty?.id || -1, handlerId },
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
      <Breadcrumb className="mb-6">
        <BreadcrumbItem href="/" icon={HiCog}>
          ???????????????? ????????????????????????????
        </BreadcrumbItem>
        <BreadcrumbItem href="./">????????????????????</BreadcrumbItem>
        <BreadcrumbItem>{faculty.title}</BreadcrumbItem>
      </Breadcrumb>
      <h1 className="mb-6 text-3xl font-bold">{faculty?.title}</h1>
      <div className="my-6 flex max-w-xl flex-col gap-2">
        <MyInput
          label="??????????"
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
            errorMessage={"?????????????????? ?? ?????????? ???????????? ?????? ??????????!"}
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
