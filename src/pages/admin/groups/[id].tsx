import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import type { NextPage } from "next";
import { api } from "../../../utils/api";
import Head from "next/head";
import { Spinner, Table, Tabs } from "flowbite-react";
import { HiCheck, HiBan, HiCog, HiOutlinePlus } from "react-icons/hi";
import { HiOutlineHashtag } from "react-icons/hi2";
import { validEmail } from "../../../utils/schemas";
import { formatOptional } from "../../../utils";
import { useAdminSession, useModal } from "../../../hooks";
import {
  Breadcrumb,
  BreadcrumbItem,
  CardButtons,
  ConfirmModal,
  ConfirmedBadge,
  DataTable,
  MyInput,
  MySelect,
  RequestedBadge,
  SubGroupModal,
  createTableProps,
} from "../../../components";
import { Student } from "../../../utils";

const GroupData = ({ id }: { id: number }) => {
  const { data } = api.group.get.useQuery(id);
  const faculties = api.faculty.get.useQuery();
  const { data: freeTeachers } = api.teacher.getFreeTeachers.useQuery();
  const changeGroup = api.group.edit.useMutation();
  const apiUtils = api.useContext();

  const defaultValue = { id: -1, name: "" };
  const [faculty, setFaculty] = useState(() => data?.faculty || { id: -1, title: "" });
  const [name, setName] = useState(() => data?.name || "");
  const [senior, setSenior] = useState(() => data?.senior || { ...defaultValue });
  const [handler, setHandler] = useState(() => data?.handler || { ...defaultValue });
  const [isError, setIsError] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  if (!data || !freeTeachers) return <></>;

  return (
    <div className="my-6 flex max-w-xl flex-col gap-2">
      <MyInput
        label="Назва"
        value={name}
        setValue={(value) => {
          setName(value);
          setIsError(false);
          setHasChanges(true);
        }}
        isValid={name.trim().length !== 0 && !isError}
      />
      <MySelect
        label="Факультет"
        options={faculties.data || []}
        field={"title"}
        value={faculty}
        setValue={(value) => {
          setFaculty(value);
          setIsError(false);
          setHasChanges(true);
        }}
      />
      <MySelect
        label="Староста"
        options={data.students}
        field={"name"}
        value={senior}
        setValue={(value) => {
          setSenior(value);
          setIsError(false);
          setHasChanges(true);
        }}
        errorText={{ title: "", text: "В цій групі немає студентів!" }}
        showBlank={true}
      />
      <MySelect
        label="Куратор"
        options={[data.handler || { ...defaultValue }, ...freeTeachers]}
        field={"name"}
        value={handler}
        setValue={(value) => {
          setHandler(value);
          setIsError(false);
          setHasChanges(true);
        }}
        errorText={{ title: "", text: "Немає вільних викладачів!" }}
        showBlank={true}
      />
      {hasChanges && (
        <CardButtons
          isError={isError}
          isLoading={changeGroup.isLoading}
          isDisabled={name.trim().length === 0}
          errorMessage="У вибраному факультеті вже є група з такою назвою!"
          onConfirm={() => {
            const seniorId = formatOptional(senior.id);
            const handlerId = formatOptional(handler.id);
            changeGroup.mutate(
              { id: data.id, name, facultyId: faculty.id, seniorId, handlerId },
              {
                onSuccess() {
                  setHasChanges(false);
                  void apiUtils.group.get.invalidate(data?.id || -1);
                },
                onError() {
                  setIsError(true);
                },
              }
            );
          }}
          onDiscard={() => {
            setName(data.name);
            setFaculty(data.faculty);
            setSenior(data.senior || { ...defaultValue });
            setHandler(data.handler || { ...defaultValue });
            setIsError(false);
            setHasChanges(false);
          }}
        />
      )}
    </div>
  );
};

interface SubGroupsProps {
  id: number;
  students: Student[];
}

const SubGroups = ({ id, students }: SubGroupsProps) => {
  const { isLoading, data: subGroups } = api.subGroup.get.useQuery(id);
  const [isCreating, setIsCreating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [subGroup, setSubGroup] = useState(() => ({ id: -1, isFull: false, name: "" }));
  const { data: subGroupStudents } = api.subGroup.getById.useQuery(subGroup.id, {
    enabled: subGroup.id !== -1,
  });
  const modalStudents = useMemo(
    () => (isCreating ? [] : subGroupStudents?.students || []),
    [isCreating, subGroupStudents?.students]
  );

  if (!subGroups || isLoading) return <></>;

  return (
    <>
      <div className="container my-3">
        <Table>
          <Table.Head>
            <Table.HeadCell>Назва</Table.HeadCell>
            <Table.HeadCell>Дії</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <td
                colSpan={2}
                className="whitespace-nowrap font-medium text-gray-500 dark:text-gray-400"
              >
                <button
                  onClick={() => {
                    setSubGroup({ id: -1, isFull: false, name: "" });
                    setIsCreating(true);
                    setIsVisible(true);
                  }}
                  className="flex w-full items-center justify-center px-6 py-3 font-semibold hover:bg-gray-50 hover:text-blue-500 dark:hover:bg-gray-600"
                >
                  <HiOutlinePlus className="mr-2 h-5 w-5" />
                  Створити
                </button>
              </td>
            </Table.Row>
            {subGroups.map((s) => (
              <Table.Row
                key={s.id}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <td className="whitespace-nowrap px-6 py-5 font-medium text-gray-900 dark:text-white">
                  {s.name}
                </td>
                <Table.Cell className="w-[25%] font-medium">
                  {!s.isFull && (
                    <button
                      onClick={() => {
                        setSubGroup(s);
                        setIsCreating(false);
                        setIsVisible(true);
                      }}
                      className="p-1 text-blue-600 hover:underline dark:text-blue-500"
                    >
                      Редагувати
                    </button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      <SubGroupModal
        key={subGroup.id}
        group={students}
        subGroupStudents={[...modalStudents]}
        isVisible={isVisible}
        setVisible={setIsVisible}
        groupId={id}
        subGroup={{ ...subGroup }}
        isCreating={isCreating}
      />
    </>
  );
};

const Group: NextPage = () => {
  useAdminSession();
  const router = useRouter();
  const id = +(router.query.id || -1);
  const { isLoading, data } = api.group.get.useQuery(id);
  const confirmStudent = api.admin.confirmStudent.useMutation();
  const createStudent = api.student.create.useMutation();
  const changeStudent = api.student.edit.useMutation();
  const resetPassword = api.admin.resetStudentPassword.useMutation();
  const deleteStudent = api.student.delete.useMutation();
  const apiUtils = api.useContext();

  const { setModalData, setModalVisibility, modalProps } = useModal();

  const tableProps = createTableProps({
    data: data?.students || [],
    options: {
      header: `Студенти`,
      showActions: true,
      canEdit: true,
      defaultRow: {
        id: -1,
        name: "",
        email: "",
        isRequested: false,
        isConfirmed: false,
      },
      enableSearch: true,
      canRemove: true,
      customActions: (row) => [
        {
          isVisible: row.isRequested,
          isLoading: confirmStudent.isLoading,
          text: "Підтвердити",
          icon: HiCheck,
          onClick: () => {
            setModalData({
              isVisible: true,
              text: `підтвердити акаунт студента ${row.name}`,
              onAccept: () => handleConfirm(row.id),
            });
          },
        },
        {
          isVisible: row.isConfirmed,
          isLoading: resetPassword.isLoading,
          text: "Скинути пароль",
          icon: HiOutlineHashtag,
          color: "failure",
          onClick: () => {
            setModalData({
              isVisible: true,
              text: `скинути пароль студента ${row.name}`,
              onAccept: () => handleResetPassword(row.id),
            });
          },
        },
        {
          isVisible: row.isRequested,
          isLoading: resetPassword.isLoading,
          text: "Відхилити",
          icon: HiBan,
          color: "failure",
          onClick: () => {
            setModalData({
              isVisible: true,
              text: `відхилити запит студента ${row.name}`,
              onAccept: () => handleResetPassword(row.id),
            });
          },
        },
      ],
    },
    columnDefinitions: [
      {
        isMain: true,
        header: "ПІБ",
        key: "name",
        editType: "text",
      },
      {
        header: "Електронна адреса",
        key: "email",
        editType: "text",
        isUnique: true,
        errorMessages: {
          CONFLICT: "Людина з такою електронною поштою вже є у системі!",
          FORMAT: "Невірний  формат",
        },
        validationFunction(row, newValue) {
          if (validEmail.safeParse(newValue.trim()).success !== true) return "FORMAT";
          return true;
        },
      },
      {
        header: "Статус",
        key: "isRequested",
        customElement: (row) => (
          <>
            <RequestedBadge isVisible={row.isRequested} />
            <ConfirmedBadge isVisible={row.isConfirmed} />
          </>
        ),
        searchBy: false,
      },
    ],
    onRowChange: ({ newRow, setResult }) => {
      const name = newRow.name.trim();
      const email = newRow.email.trim();
      const { id } = newRow;
      changeStudent.mutate(
        { id, name, email },
        {
          onError(error) {
            if (error.data?.code !== "CONFLICT") {
              setResult(false);
              void apiUtils.group.get.invalidate(data?.id);
            } else setResult({ email: "CONFLICT" });
          },
          onSuccess() {
            apiUtils.group.get.setData(data?.id || -1, (old) =>
              old
                ? {
                    ...old,
                    students: old.students.map((s) =>
                      s.id !== id ? s : { ...s, name, email }
                    ),
                  }
                : old
            );
            setResult();
          },
        }
      );
    },
    onNewRowCreate: ({ newRow: row, setResult }) => {
      createStudent.mutate(
        { name: row.name.trim(), email: row.email.trim(), groupId: data?.id || -1 },
        {
          onError(error) {
            if (error.data?.code !== "CONFLICT") {
              setResult(false);
              void apiUtils.group.get.invalidate(data?.id);
            }
            setResult({ email: "CONFLICT" });
          },
          onSuccess() {
            setResult();
            void apiUtils.group.get.invalidate(data?.id);
          },
        }
      );
    },
    onRowRemove: (row) =>
      setModalData({
        isVisible: true,
        text: `видалити студента ${row.name}`,
        onAccept: () => handleRemove(row.id),
      }),
  });

  const handleRemove = (studentId: number) => {
    setModalVisibility(false);
    deleteStudent.mutate(studentId, {
      onSuccess: () =>
        apiUtils.group.get.setData(id, (old) =>
          old
            ? {
                ...old,
                students: old.students.filter((s) => s.id !== studentId),
                senior: old.senior?.id === studentId ? null : old.senior,
              }
            : old
        ),
    });
  };

  const handleConfirm = (id: number) => {
    setModalVisibility(false);
    confirmStudent.mutate(id, {
      onSuccess: () => {
        apiUtils.group.get.setData(data?.id || -1, (old) =>
          old
            ? {
                ...old,
                students: old.students.map((s) =>
                  s.id !== id ? s : { ...s, isConfirmed: true, isRequested: false }
                ),
              }
            : old
        );
      },
    });
  };

  const handleResetPassword = (id: number) => {
    setModalVisibility(false);
    resetPassword.mutate(id, {
      onSuccess: () => {
        void apiUtils.group.get.invalidate(data?.id);
      },
    });
  };

  if (isLoading || !data)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  return (
    <>
      <Head>
        <title>{data.faculty.title + ". " + data.name}</title>
      </Head>

      <Breadcrumb className="mb-6">
        <BreadcrumbItem href="/" icon={HiCog}>
          Сторінка адміністратора
        </BreadcrumbItem>
        {router.query.from === "faculties" ? (
          <>
            <BreadcrumbItem href="/admin/faculties">Факультети</BreadcrumbItem>
            <BreadcrumbItem href={`/admin/faculties/${data.faculty.id}`}>
              {data.faculty.title}
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem href="/admin/groups">Групи</BreadcrumbItem>
        )}
        <BreadcrumbItem>{data.name}</BreadcrumbItem>
      </Breadcrumb>

      <Tabs.Group>
        <Tabs.Item title="Група">
          <h1 className="mb-6 text-3xl font-bold">
            {data.faculty.title + ". " + data.name}
          </h1>
          <GroupData id={id} />
        </Tabs.Item>
        <Tabs.Item title="Студенти">
          <h1 className="mb-6 text-3xl font-bold">
            {data.faculty.title + ". " + data.name}
          </h1>
          <DataTable {...tableProps} />
        </Tabs.Item>
        <Tabs.Item title="Підгрупи">
          <h1 className="mb-6 text-3xl font-bold">
            {data.faculty.title + ". " + data.name}
          </h1>
          <SubGroups id={id} students={data.students} />
        </Tabs.Item>
      </Tabs.Group>
      <ConfirmModal {...modalProps} />
    </>
  );
};

export default Group;
