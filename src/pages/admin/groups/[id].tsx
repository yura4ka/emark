import { useRouter } from "next/router";
import { useState } from "react";
import { getServerAuthSession } from "../../../server/auth";
import type { GetServerSidePropsContext, NextPage } from "next";
import { api } from "../../../utils/api";
import Head from "next/head";
import { Badge, Spinner } from "flowbite-react";
import { HiCheck, HiBan } from "react-icons/hi";
import { HiOutlineHashtag } from "react-icons/hi2";
import DataTable, { createTableProps } from "../../../components/DataTable/DataTable";
import MySelect from "../../../components/MySelect";
import MyInput from "../../../components/Inputs/MyInput";
import ConfirmModal from "../../../components/Modals/ConfirmModal";
import CustomAction from "../../../components/Buttons/CustomAction";
import { useModal } from "../../../hooks/useModal";
import CardButtons from "../../../components/Buttons/CardButtons";
import { validEmail } from "../../../utils/schemas";
import { formatOptional } from "../../../utils/utils";
import { HiCog } from "react-icons/hi";
import { Breadcrumb, BreadcrumbItem } from "../../../components/Breadcrumb";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);
  if (!session?.user.role.isAdmin)
    return { redirect: { destination: "/", permanent: false } };
  return { props: { user: session.user } };
};

const Group: NextPage = () => {
  const router = useRouter();
  const id = +(router.query.id || -1);
  const { isLoading, data } = api.group.get.useQuery(id);
  const confirmStudent = api.admin.confirmStudent.useMutation();
  const createStudent = api.student.create.useMutation();
  const changeStudent = api.student.edit.useMutation();
  const changeGroup = api.group.edit.useMutation();
  const resetPassword = api.admin.resetStudentPassword.useMutation();
  const faculties = api.faculty.get.useQuery();
  const { data: freeTeachers } = api.teacher.getFreeTeachers.useQuery();
  const apiUtils = api.useContext();

  const { setModalData, setModalVisibility, modalProps } = useModal();

  const tableProps = createTableProps({
    data: data?.students || [],
    options: {
      header: `Студенти`,
      showActions: true,
      canEdit: true,
      defaultRow: { id: -1, name: "", email: "", isRequested: false, isConfirmed: false },
      enableSearch: true,
      customActions: (row) => (
        <>
          <CustomAction
            isVisible={row.isRequested}
            isLoading={confirmStudent.isLoading}
            text="Підтвердити"
            icon={<HiCheck className="mr-1 h-4 w-4" />}
            onClick={() => {
              setModalData({
                isVisible: true,
                text: `підтвердити акаунт студента ${row.name}`,
                onAccept: () => handleConfirm(row.id),
              });
            }}
          />
          <CustomAction
            isVisible={row.isConfirmed}
            isLoading={resetPassword.isLoading}
            text="Скинути пароль"
            icon={<HiOutlineHashtag className="mr-1 h-4 w-4" />}
            color="failure"
            onClick={() => {
              setModalData({
                isVisible: true,
                text: `скинути пароль студента ${row.name}`,
                onAccept: () => handleResetPassword(row.id),
              });
            }}
          />
          <CustomAction
            isVisible={row.isRequested}
            isLoading={resetPassword.isLoading}
            text="Відхилити"
            icon={<HiBan className="mr-1 h-4 w-4" />}
            color="failure"
            onClick={() => {
              setModalData({
                isVisible: true,
                text: `відхилити запит студента ${row.name}`,
                onAccept: () => handleResetPassword(row.id),
              });
            }}
          />
        </>
      ),
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
            {row.isRequested && (
              <Badge color="failure" theme={{ root: { base: "font-semibold" } }}>
                Запит
              </Badge>
            )}
            {row.isConfirmed && (
              <Badge color="success" theme={{ root: { base: "font-semibold" } }}>
                Підтверджений
              </Badge>
            )}
          </>
        ),
        searchBy: false,
      },
    ],
    onRowChange: ({ newRow, setLoading, setValidation }) => {
      const name = newRow.name.trim();
      const email = newRow.email.trim();
      const { id } = newRow;
      setLoading(true);
      changeStudent.mutate(
        { id, name, email },
        {
          onError(error) {
            if (error.data?.code === "CONFLICT") setValidation({ email: "CONFLICT" });
            else void apiUtils.group.get.invalidate(data?.id);
            setLoading(false);
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
            setLoading(false);
          },
        }
      );
    },
    onNewRowCreate: ({ newRow: row, setLoading, setValidation }) => {
      setLoading(true);
      createStudent.mutate(
        { name: row.name.trim(), email: row.email.trim(), groupId: data?.id || -1 },
        {
          onError(error) {
            if (error.data?.code === "CONFLICT") setValidation({ email: "CONFLICT" });
            else void apiUtils.group.get.invalidate(data?.id);
            setLoading(false);
          },
          onSuccess() {
            setLoading(false);
            void apiUtils.group.get.invalidate(data?.id);
          },
        }
      );
    },
  });

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

  const defaultValue = { id: -1, name: "" };
  const [faculty, setFaculty] = useState(() => data?.faculty || { id: -1, title: "" });
  const [name, setName] = useState(() => data?.name || "");
  const [senior, setSenior] = useState(() => data?.senior || { ...defaultValue });
  const [handler, setHandler] = useState(() => data?.handler || { ...defaultValue });
  const [isError, setIsError] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  if (isLoading || !data || !freeTeachers)
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

      <h1 className="mb-6 text-3xl font-bold">{data.faculty.title + ". " + data.name}</h1>
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
            }}
          />
        )}
      </div>

      <ConfirmModal {...modalProps} />
      <DataTable {...tableProps} />
    </>
  );
};

export default Group;
