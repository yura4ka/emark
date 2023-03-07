import { useRouter } from "next/router";
import { useState } from "react";
import { getServerAuthSession } from "../../../server/auth";
import type { GetServerSidePropsContext, NextPage } from "next";
import { z } from "zod";
import { api } from "../../../utils/api";
import Head from "next/head";
import { Badge, Button, Spinner } from "flowbite-react";
import { HiCheck, HiBan } from "react-icons/hi";
import { HiOutlineHashtag } from "react-icons/hi2";
import DataTable, { createTableProps } from "../../../components/DataTable/DataTable";
import ConfirmModal from "../../../components/Modals/ConfirmModal";
import MySelect from "../../../components/MySelect";
import MyInput from "../../../components/Inputs/MyInput";

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
  const rejectStudent = api.admin.rejectStudent.useMutation();
  const faculties = api.faculty.get.useQuery();
  const apiUtils = api.useContext();

  const [modalData, setModalData] = useState({
    onAccept: () => console.error("accept error"),
    text: "",
    isVisible: false,
  });

  function CustomAction(props: {
    isVisible: boolean;
    isLoading: boolean;
    text: string;
    modalText: string;
    icon: JSX.Element;
    onAccept: () => void;
    color?: string;
  }) {
    return props.isVisible ? (
      <Button
        disabled={props.isLoading}
        size="xs"
        color={props.color}
        onClick={() => {
          setModalData({
            isVisible: true,
            text: props.modalText,
            onAccept: props.onAccept,
          });
        }}
      >
        {props.icon}
        {props.text}
      </Button>
    ) : (
      <></>
    );
  }

  const tableProps = createTableProps({
    data: data?.students || [],
    options: {
      header: `Студенти`,
      showActions: true,
      canEdit: true,
      defaultRow: { id: -1, name: "", email: "", isRequested: false, isConfirmed: false },
      customActions: (row) => (
        <>
          <CustomAction
            isVisible={row.isRequested}
            isLoading={confirmStudent.isLoading}
            modalText={`підтвердити акаунт студента ${row.name}`}
            text="Підтвердити"
            icon={<HiCheck className="mr-1 h-4 w-4" />}
            onAccept={() => handleConfirm(row.id)}
          />
          <CustomAction
            isVisible={row.isConfirmed}
            isLoading={resetPassword.isLoading}
            modalText={`скинути пароль студента ${row.name}}`}
            text="Скинути пароль"
            icon={<HiOutlineHashtag className="mr-1 h-4 w-4" />}
            color="failure"
            onAccept={() => handleResetPassword(row.id)}
          />
          <CustomAction
            isVisible={row.isRequested}
            isLoading={rejectStudent.isLoading}
            modalText={`відхилити запит студента ${row.name}}`}
            text="Відхилити"
            icon={<HiBan className="mr-1 h-4 w-4" />}
            color="failure"
            onAccept={() => handleReject(row.id)}
          />
        </>
      ),
    },
    columnDefinitions: [
      {
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
          if (z.string().email().safeParse(newValue.trim()).success !== true)
            return "FORMAT";
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
    setModalData((data) => ({ ...data, isVisible: false }));
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
    setModalData((data) => ({ ...data, isVisible: false }));
    resetPassword.mutate(id, {
      onSuccess: () => {
        void apiUtils.group.get.invalidate(data?.id);
      },
    });
  };

  const handleReject = (id: number) => {
    setModalData((data) => ({ ...data, isVisible: false }));
    rejectStudent.mutate(id, {
      onSuccess: () => {
        void apiUtils.group.get.invalidate(data?.id);
      },
    });
  };

  const [senior, setSenior] = useState(() => data?.senior || { id: -1, name: "" });
  const [faculty, setFaculty] = useState(() => data?.faculty || { id: -1, title: "" });
  const [name, setName] = useState(() => data?.name || "");
  const [isError, setIsError] = useState(false);

  const isGroupChanged =
    data?.students.length !== 0 &&
    (senior.id !== data?.senior?.id ||
      senior.id === -1 ||
      faculty.id !== data.faculty.id ||
      name !== data.name);

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

      <h1 className="mb-6 text-3xl font-bold">{data.faculty.title + ". " + data.name}</h1>

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
        <MySelect
          label="Факультет"
          options={faculties.data || []}
          field={"title"}
          value={faculty}
          setValue={(value) => {
            setFaculty(value);
            setIsError(false);
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
          }}
        />
        {isGroupChanged && name.trim().length !== 0 && (
          <div className="flex gap-1">
            <Button
              className="mt-2"
              color={"success"}
              disabled={changeGroup.isLoading || isError}
              onClick={() => {
                changeGroup.mutate(
                  { id: data.id, name, facultyId: faculty.id, seniorId: senior.id },
                  {
                    onSuccess() {
                      void apiUtils.group.get.invalidate(data?.id || -1);
                    },
                    onError() {
                      setIsError(true);
                    },
                  }
                );
              }}
            >
              Зберегти
            </Button>
            <Button
              className="mt-2"
              color={"failure"}
              onClick={() => {
                setName(data.name);
                setFaculty(data.faculty);
                setSenior(data.senior || { id: -1, name: "" });
                setIsError(false);
              }}
            >
              Скасувати зміни
            </Button>
          </div>
        )}
        {isError && (
          <p className="text-sm text-red-600 dark:text-red-500">
            У вибраному факультеті вже є група з такою назвою!
          </p>
        )}
      </div>

      <ConfirmModal
        text={modalData.text}
        isVisible={modalData.isVisible}
        onAccept={() => modalData.onAccept()}
        onCancel={() => setModalData((data) => ({ ...data, isVisible: false }))}
        buttonText="Підтвердити"
      />
      <DataTable {...tableProps} />
    </>
  );
};

export default Group;
