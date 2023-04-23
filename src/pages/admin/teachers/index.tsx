import { Spinner } from "flowbite-react";
import Head from "next/head";
import { useMemo } from "react";
import {
  createTableProps,
  DataTable,
  ConfirmModal,
  RequestedBadge,
  ConfirmedBadge,
  AdminBadge,
} from "../../../components";
import { useAdminSession, useModal } from "../../../hooks";
import { api } from "../../../utils/api";
import { validEmail } from "../../../utils/schemas";
import { formatOptional } from "../../../utils";
import { HiCheck, HiBan, HiOutlineKey } from "react-icons/hi";
import { HiOutlineHashtag } from "react-icons/hi2";
import type { NextPageWithLayout } from "../../_app";

const Teachers: NextPageWithLayout = () => {
  const user = useAdminSession();
  const { isLoading, data } = api.teacher.get.useQuery();
  const updateTeacher = api.teacher.update.useMutation();
  const createTeacher = api.teacher.create.useMutation();
  const makeAdmin = api.teacher.makeAdmin.useMutation();
  const sendRequest = api.admin.sendTeacherRequest.useMutation();
  const resetPassword = api.admin.resetTeacherPassword.useMutation();
  const { data: freeGroups } = api.teacher.getFreeGroups.useQuery();
  const deleteTeacher = api.teacher.delete.useMutation();
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
        <Spinner size="xl" />
      </div>
    );

  const updateTeachers = (
    id: number,
    data: { isConfirmed: boolean; isRequested: boolean }
  ) => {
    apiUtils.teacher.get.setData(undefined, (oldData) => {
      if (!oldData) return;
      return oldData.map((d) => (d.id === id ? { ...d, ...data } : d));
    });
  };

  const handleRequest = (id: number) => {
    setModalVisibility(false);
    sendRequest.mutate(id, {
      onSuccess: () => updateTeachers(id, { isConfirmed: false, isRequested: true }),
    });
  };

  const handleResetPassword = (id: number, doRequest = false) => {
    setModalVisibility(false);
    resetPassword.mutate(
      { id, doRequest },
      {
        onSuccess: () =>
          updateTeachers(id, { isConfirmed: false, isRequested: doRequest }),
      }
    );
  };

  const tableProps = createTableProps({
    data: teachers,
    options: {
      header: "Викладачі",
      canEdit: true,
      showActions: true,
      enableSearch: true,
      canRemove: (row) => row.id !== user?.id,
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
      customActions: (row) => [
        {
          isVisible: !row.isRequested && !row.isConfirmed,
          isLoading: sendRequest.isLoading,
          text: "Надіслати запрошення",
          icon: HiCheck,
          onClick: () => {
            setModalData({
              isVisible: true,
              text: `підтвердити акаунт викладачу ${row.name}`,
              onAccept: () => handleRequest(row.id),
            });
          },
        },
        {
          isVisible: row.isConfirmed && row.id !== user?.id,
          isLoading: resetPassword.isLoading,
          text: "Скинути пароль",
          icon: HiOutlineHashtag,
          color: "failure",
          onClick: () => {
            setModalData({
              isVisible: true,
              text: `скинути пароль викладачу ${row.name}`,
              onAccept: () => handleResetPassword(row.id, true),
            });
          },
        },
        {
          isVisible: row.isRequested,
          isLoading: resetPassword.isLoading,
          text: "Скасувати",
          icon: HiBan,
          color: "failure",
          onClick: () => {
            setModalData({
              isVisible: true,
              text: `скасувати запит викладача ${row.name}`,
              onAccept: () => handleResetPassword(row.id),
            });
          },
        },
        {
          isVisible: !row.isAdmin && row.isConfirmed,
          isLoading: makeAdmin.isLoading,
          text: "Назначити адміном",
          icon: HiOutlineKey,
          color: "warning",
          onClick: () =>
            setModalData({
              isVisible: true,
              text: `назначити ${row.name} адміністратором`,
              onAccept: () => handleAssignAdmin(row.id),
            }),
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
          <div className="flex gap-1">
            <AdminBadge isVisible={row.isAdmin} />
            <RequestedBadge isVisible={row.isRequested} />
            <ConfirmedBadge isVisible={row.isConfirmed && !row.isAdmin} />
          </div>
        ),
      },
    ],
    onRowChange: ({ newRow, setResult }) => {
      const { id } = newRow;
      const name = newRow.name.trim();
      const email = newRow.email.trim();
      const handlerOfId = formatOptional(newRow.handlerOfId);

      updateTeacher.mutate(
        { id, name, email, handlerOfId },
        {
          onSuccess() {
            setResult();
            void apiUtils.teacher.get.invalidate();
          },
          onError(error) {
            if (error.data?.code === "CONFLICT") setResult({ title: "CONFLICT" });
            else {
              setResult(false);
              void apiUtils.teacher.get.invalidate();
            }
          },
        }
      );
    },
    onNewRowCreate: ({ newRow, setResult }) => {
      const handlerOfId = newRow.handlerOfId === -1 ? undefined : newRow.handlerOfId;
      createTeacher.mutate(
        {
          name: newRow.name.trim(),
          email: newRow.email.trim(),
          handlerOfId,
        },
        {
          onSuccess() {
            setResult();
            void apiUtils.teacher.get.invalidate();
          },
          onError(error) {
            if (error.data?.code === "CONFLICT") setResult({ title: "CONFLICT" });
            else {
              setResult(false);
              void apiUtils.teacher.get.invalidate();
            }
          },
        }
      );
    },
    onRowRemove: (row) =>
      setModalData({
        isVisible: true,
        text: `видалити ${row.name}`,
        onAccept: () => handleRemove(row.id),
      }),
  });

  const handleAssignAdmin = (id: number) => {
    setModalVisibility(false);
    makeAdmin.mutate(id, { onSettled: () => void apiUtils.teacher.get.invalidate() });
  };

  const handleRemove = (id: number) => {
    setModalVisibility(false);
    deleteTeacher.mutate(id, {
      onSuccess: () =>
        void apiUtils.teacher.get.setData(undefined, (old) =>
          old ? old.filter((t) => t.id !== id) : old
        ),
    });
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
