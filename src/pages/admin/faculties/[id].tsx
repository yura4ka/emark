import type { NextPage } from "next";
import { useRouter } from "next/router";
import { api } from "../../../utils/api";
import Head from "next/head";
import { Spinner } from "flowbite-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { formatOptional } from "../../../utils";
import { HiCog } from "react-icons/hi";
import { useAdminSession, useModal } from "../../../hooks";
import {
  Breadcrumb,
  BreadcrumbItem,
  CardButtons,
  ConfirmModal,
  DataTable,
  MyInput,
  createTableProps,
} from "../../../components";

const Faculty: NextPage = () => {
  useAdminSession();
  const router = useRouter();
  const id = +(router.query.id || -1);
  const { data: faculty } = api.faculty.getById.useQuery(id);
  const { isLoading, data } = api.faculty.getGroupsFull.useQuery(id);
  const changeGroup = api.group.edit.useMutation();
  const createGroup = api.group.create.useMutation();
  const changeFaculty = api.faculty.rename.useMutation();
  const { data: freeTeachers } = api.teacher.getFreeTeachers.useQuery();
  const deleteGroup = api.group.delete.useMutation();
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
        isMain: true,
        header: "Назва",
        key: "name",
        editType: "text",
        isUnique: true,
        errorMessages: { CONFLICT: "Група з такою назвою вже існує!" },
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
        header: "Куратор",
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
        header: "Староста",
        key: "senior",
        idKey: "seniorId",
        editType: "select",
        nullable: true,
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
        handlerId: -1,
        senior: "-",
        seniorId: -1,
        count: 0,
      },
      enableSearch: true,
      canRemove: true,
    },
    onRowChange: ({ newRow, setResult }) => {
      const name = newRow.name.trim();
      const groupId = newRow.id;
      const handlerId = formatOptional(newRow.handlerId);
      const seniorId = formatOptional(newRow.seniorId);
      changeGroup.mutate(
        { id: groupId, name, facultyId: id, seniorId, handlerId },
        {
          onError(error) {
            if (error.data?.code === "CONFLICT") setResult({ title: "CONFLICT" });
            else {
              setResult(false);
              void apiUtils.faculty.getGroupsFull.invalidate(faculty?.id);
            }
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
            setResult();
            void apiUtils.teacher.getFreeTeachers.invalidate();
          },
        }
      );
    },
    onNewRowCreate: ({ newRow: row, setResult }) => {
      const handlerId = formatOptional(row.handlerId);
      createGroup.mutate(
        { name: row.name.trim(), facultyId: faculty?.id || -1, handlerId },
        {
          onError(error) {
            if (error.data?.code === "CONFLICT") setResult({ title: "CONFLICT" });
            else {
              setResult(false);
              void apiUtils.faculty.getGroupsFull.invalidate();
            }
          },
          onSuccess() {
            setResult();
            void apiUtils.faculty.getGroupsFull.invalidate(faculty?.id);
          },
        }
      );
    },
    onRowRemove: (row) =>
      setModalData({
        isVisible: true,
        text: `видалити групу ${row.name}`,
        onAccept: () => handleRemove(row.id),
      }),
  });

  const handleRemove = (groupId: number) => {
    setModalVisibility(false);
    deleteGroup.mutate(groupId, {
      onSuccess: () =>
        apiUtils.faculty.getGroupsFull.setData(id, (old) =>
          old ? old.filter((g) => g.id !== groupId) : old
        ),
    });
  };

  const [name, setName] = useState(() => faculty?.title || "");
  const [isError, setIsError] = useState(false);
  const isChanged = name !== faculty?.title;

  const { modalProps, setModalData, setModalVisibility } = useModal();

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
          Сторінка адміністратора
        </BreadcrumbItem>
        <BreadcrumbItem href="./">Факультети</BreadcrumbItem>
        <BreadcrumbItem>{faculty.title}</BreadcrumbItem>
      </Breadcrumb>
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
      <ConfirmModal {...modalProps} />
    </>
  );
};

export default Faculty;
