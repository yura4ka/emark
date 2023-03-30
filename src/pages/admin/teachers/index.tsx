import { Badge, Spinner } from "flowbite-react";
import Head from "next/head";
import { useMemo } from "react";
import CustomAction from "../../../components/Buttons/CustomAction";
import DataTable, { createTableProps } from "../../../components/DataTable/DataTable";
import ConfirmModal from "../../../components/Modals/ConfirmModal";
import useAdminSession from "../../../hooks/useAdminSession";
import { useModal } from "../../../hooks/useModal";
import { api } from "../../../utils/api";
import { validEmail } from "../../../utils/schemas";
import { HiOutlineKey } from "react-icons/hi";
import { formatOptional } from "../../../utils/utils";
import { HiCheck, HiBan } from "react-icons/hi";
import { HiOutlineHashtag } from "react-icons/hi2";
import type { NextPageWithLayout } from "../../_app";

const Teachers: NextPageWithLayout = () => {
  useAdminSession();
  const { isLoading, data } = api.teacher.get.useQuery();
  const updateTeacher = api.teacher.update.useMutation();
  const createTeacher = api.teacher.create.useMutation();
  const makeAdmin = api.teacher.makeAdmin.useMutation();
  const confirmTeacher = api.admin.confirmTeacher.useMutation();
  const resetPassword = api.admin.resetTeacherPassword.useMutation();
  const { data: freeGroups } = api.teacher.getFreeGroups.useQuery();
  const apiUtils = api.useContext();

  const { setModalData, modalProps, setModalVisibility } = useModal();

  const teachers = useMemo(
    () =>
      data?.map((t) => ({
        ...t,
        handlerOf: t.handlerOf
          ? `${t.handlerOf.faculty.title}: ${t.handlerOf.name}`
          : "-",
        handlerOfId: t.handlerOf?.id || -1,
      })) || [],
    [data]
  );

  const freeGroupsOptions = useMemo(
    () =>
      freeGroups?.map((g) => ({
        id: g.id,
        option: `${g.faculty.title}: ${g.name}`,
      })) || [],
    [freeGroups]
  );

  if (isLoading || !data)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  const updateTeachers = (
    id: number,
    data: { isConfirmed: boolean; isRequested: boolean }
  ) => {
    apiUtils.senior.getClassList.setData(undefined, (oldData) => {
      if (!oldData) return;
      return {
        ...oldData,
        students: oldData.students.map((s) => (s.id === id ? { ...s, ...data } : s)),
      };
    });
  };

  const handleConfirm = (id: number) => {
    setModalVisibility(false);
    confirmTeacher.mutate(id, {
      onSuccess: () => updateTeachers(id, { isConfirmed: true, isRequested: false }),
    });
  };

  const handleResetPassword = (id: number) => {
    setModalVisibility(false);
    resetPassword.mutate(id, {
      onSuccess: () => updateTeachers(id, { isConfirmed: false, isRequested: false }),
    });
  };

  const tableProps = createTableProps({
    data: teachers,
    options: {
      header: "Викладачі",
      canEdit: true,
      showActions: true,
      enableSearch: true,
      defaultRow: {
        id: -1,
        email: "",
        name: "",
        isAdmin: false,
        handlerOf: "",
        handlerOfId: -1,
        isConfirmed: false,
        isRequested: false,
      },
      customActions: (row) => (
        <>
          <CustomAction
            isVisible={row.isRequested}
            isLoading={confirmTeacher.isLoading}
            text="Підтвердити"
            icon={<HiCheck className="mr-1 h-4 w-4" />}
            onClick={() => {
              setModalData({
                isVisible: true,
                text: `підтвердити акаунт викладачу ${row.name}`,
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
                text: `скинути пароль викладачу ${row.name}`,
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
                text: `відхилити запит викладача ${row.name}`,
                onAccept: () => handleResetPassword(row.id),
              });
            }}
          />
          <CustomAction
            isVisible={!row.isAdmin && row.isConfirmed}
            isLoading={makeAdmin.isLoading}
            text="Назначити адміном"
            icon={<HiOutlineKey className="mr-1 h-4 w-4" />}
            color="warning"
            onClick={() =>
              setModalData({
                isVisible: true,
                text: `назначити ${row.name} адміністратором`,
                onAccept: () => handleAssignAdmin(row.id),
              })
            }
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
          FORMAT: "Невірний формат",
        },
        validationFunction(row, newValue) {
          if (validEmail.safeParse(newValue).success === false) return "FORMAT";
          return true;
        },
      },
      {
        header: "Куратор групи",
        key: "handlerOf",
        editType: "select",
        idKey: "handlerOfId",
        nullable: true,
        changeOptions: (row) => {
          const option = { id: row.handlerOfId, option: row.handlerOf };
          return option.id === -1 ? freeGroupsOptions : [...freeGroupsOptions, option];
        },
      },
      {
        header: "Статус",
        key: "isAdmin",
        searchBy: false,
        customElement: (row) => (
          <>
            {row.isAdmin && (
              <Badge color="purple" theme={{ root: { base: "font-semibold" } }}>
                Адміністратор
              </Badge>
            )}
            {row.isRequested && (
              <Badge color="failure" theme={{ root: { base: "font-semibold" } }}>
                Запит
              </Badge>
            )}
            {row.isConfirmed && !row.isAdmin && (
              <Badge color="success" theme={{ root: { base: "font-semibold" } }}>
                Підтверджений
              </Badge>
            )}
          </>
        ),
      },
    ],
    onRowChange: ({ newRow, setValidation, setLoading }) => {
      setLoading(true);
      const { id } = newRow;
      const name = newRow.name.trim();
      const email = newRow.email.trim();
      const handlerOfId = formatOptional(newRow.handlerOfId);

      updateTeacher.mutate(
        { id, name, email, handlerOfId },
        {
          onSuccess() {
            void apiUtils.teacher.get.invalidate();
            setLoading(false);
          },
          onError(error) {
            if (error.data?.code === "CONFLICT") setValidation({ title: "CONFLICT" });
            else void apiUtils.teacher.get.invalidate();
            setLoading(false);
          },
        }
      );
    },
    onNewRowCreate: ({ newRow, setValidation, setLoading }) => {
      setLoading(true);
      const handlerOfId = newRow.handlerOfId === -1 ? undefined : newRow.handlerOfId;
      createTeacher.mutate(
        {
          name: newRow.name.trim(),
          email: newRow.email.trim(),
          handlerOfId,
        },
        {
          onSuccess() {
            void apiUtils.teacher.get.invalidate();
            setLoading(false);
          },
          onError(error) {
            if (error.data?.code === "CONFLICT") setValidation({ title: "CONFLICT" });
            else void apiUtils.teacher.get.invalidate();
            setLoading(false);
          },
        }
      );
    },
  });

  const handleAssignAdmin = (id: number) => {
    setModalVisibility(false);
    makeAdmin.mutate(id, { onSettled: () => void apiUtils.teacher.get.invalidate() });
  };

  return (
    <>
      <Head>
        <title>Викладачі</title>
      </Head>
      <ConfirmModal {...modalProps} />
      <DataTable {...tableProps} />
    </>
  );
};

Teachers.getLayout = (page) => (
  <main className="mx-auto w-full max-w-[85rem] p-2.5">{page}</main>
);

export default Teachers;
