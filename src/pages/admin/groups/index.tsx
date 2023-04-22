import { Spinner } from "flowbite-react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "../../../utils/api";
import { useAdminSession, useModal } from "../../../hooks";
import { ConfirmModal, DataTable, createTableProps } from "../../../components";

const Groups: NextPage = () => {
  useAdminSession();
  const { isLoading, data: groups } = api.group.getAll.useQuery();
  const removeGroup = api.group.delete.useMutation();
  const apiUtils = api.useContext();

  const { modalProps, setModalData, setModalVisibility } = useModal();

  if (isLoading || !groups)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  const tableProps = createTableProps({
    data: groups,
    options: {
      header: "Групи",
      canRemove: true,
      showActions: true,
      enableSearch: true,
    },
    columnDefinitions: [
      {
        header: "Факультет",
        key: "faculty",
        customElement: (row) => (
          <Link href={`faculties/${row.facultyId}`}>{row.faculty}</Link>
        ),
      },
      {
        header: "Група",
        key: "name",
        customElement: (row) => <Link href={`groups/${row.id}`}>{row.name}</Link>,
      },
      {
        header: "Куратор",
        key: "handler",
      },
      {
        header: "Староста",
        key: "senior",
        customElement: (row) => (
          <Link href={`students/${row.seniorId}`}>{row.senior}</Link>
        ),
      },
      {
        header: "Кількість студентів",
        key: "students",
        searchBy: false,
      },
    ],
    onRowRemove: (row) =>
      setModalData({
        isVisible: true,
        text: `Видалити групу ${row.name} на факультеті ${row.faculty}`,
        onAccept: () => handleRemove(row.id),
      }),
  });

  const handleRemove = (id: number) => {
    setModalVisibility(false);
    removeGroup.mutate(id, {
      onSuccess: () =>
        apiUtils.group.getAll.setData(undefined, (old) =>
          old ? old.filter((g) => g.id !== id) : old
        ),
    });
  };

  return (
    <>
      <Head>
        <title>Групи</title>
      </Head>
      <DataTable {...tableProps} />
      <ConfirmModal {...modalProps} />
    </>
  );
};
export default Groups;
