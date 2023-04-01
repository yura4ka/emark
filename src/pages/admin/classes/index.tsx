import { Spinner } from "flowbite-react";
import Head from "next/head";
import Link from "next/link";
import DataTable, { createTableProps } from "../../../components/DataTable/DataTable";
import useAdminSession from "../../../hooks/useAdminSession";
import { api } from "../../../utils/api";
import type { NextPageWithLayout } from "../../_app";
import { useModal } from "../../../hooks/useModal";
import ConfirmModal from "../../../components/Modals/ConfirmModal";

const Classes: NextPageWithLayout = () => {
  useAdminSession();
  const { data: classes, isLoading } = api.class.get.useQuery();
  const deleteClass = api.class.delete.useMutation();
  const apiUtils = api.useContext();

  const { modalProps, setModalData, setModalVisibility } = useModal();

  if (isLoading || !classes)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  const tableProps = createTableProps({
    data: classes,
    columnDefinitions: [
      {
        isMain: true,
        header: "Назва",
        key: "name",
        editType: "text",
        customElement: (row) => <Link href={`./classes/${row.id}`}>{row.name}</Link>,
      },
      {
        header: "Факультет",
        key: "faculty",
      },
      {
        header: "Предмет",
        key: "subject",
      },
      {
        header: "Група",
        key: "group",
      },
      {
        header: "Підгрупа",
        key: "subGroup",
      },
      {
        header: "Викладач",
        key: "teacher",
      },
    ],
    options: {
      header: "Класи",
      createOnNewPage: "./classes/create",
      enableSearch: true,
      showActions: true,
      canRemove: true,
    },
    onRowRemove: (row) =>
      setModalData({
        isVisible: true,
        text: `видалити клас ${row.name}`,
        onAccept: () => handleRemove(row.id),
      }),
  });

  const handleRemove = (id: number) => {
    setModalVisibility(false);
    deleteClass.mutate(id, {
      onSuccess: () =>
        apiUtils.class.get.setData(undefined, (old) =>
          old ? old.filter((c) => c.id !== id) : old
        ),
    });
  };

  return (
    <main className="mx-auto w-full max-w-[85rem] p-2.5">
      <Head>
        <title>Класи</title>
      </Head>
      <DataTable {...tableProps} />
      <ConfirmModal {...modalProps} />
    </main>
  );
};

Classes.getLayout = (page) => <>{page}</>;

export default Classes;
