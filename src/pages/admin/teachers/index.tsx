import { Badge, Spinner } from "flowbite-react";
import type { NextPage } from "next";
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

const Teachers: NextPage = () => {
  useAdminSession();
  const { isLoading, data } = api.teacher.get.useQuery();
  const updateTeacher = api.teacher.update.useMutation();
  const createTeacher = api.teacher.create.useMutation();
  const makeAdmin = api.teacher.makeAdmin.useMutation();
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

  const tableProps = createTableProps({
    data: teachers,
    options: {
      header: "Викладачі",
      canEdit: true,
      showActions: true,
      defaultRow: {
        id: -1,
        email: "",
        name: "",
        isAdmin: false,
        handlerOf: "",
        handlerOfId: -1,
      },
      customActions: (row) => (
        <CustomAction
          isVisible={!row.isAdmin}
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
          if (validEmail.safeParse(newValue).success === false) return "FORMAT";
          return true;
        },
      },
      {
        header: "Куратор групи",
        key: "handlerOf",
        editType: "select",
        idKey: "handlerOfId",
        changeOptions: (row) => {
          const option = { id: row.handlerOfId, option: row.handlerOf };
          return option.id === -1 ? freeGroupsOptions : [...freeGroupsOptions, option];
        },
      },
      {
        header: "Статус",
        key: "isAdmin",
        customElement: (row) => (
          <>
            {row.isAdmin && (
              <Badge color="purple" theme={{ root: { base: "font-semibold" } }}>
                Адміністратор
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
      const handlerOfId = newRow.handlerOfId === -1 ? undefined : newRow.handlerOfId;

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

export default Teachers;
