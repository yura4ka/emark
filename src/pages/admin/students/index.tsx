import Head from "next/head";
import { api } from "../../../utils/api";
import { Spinner } from "flowbite-react";
import DataTable, { createTableProps } from "../../../components/DataTable/DataTable";
import Link from "next/link";
import useAdminSession from "../../../hooks/useAdminSession";
import ConfirmModal from "../../../components/Modals/ConfirmModal";
import { ConfirmedBadge, RequestedBadge, SeniorBadge } from "../../../components/Badges";
import type { NextPageWithLayout } from "../../_app";
import { useModal } from "../../../hooks/useModal";

const Students: NextPageWithLayout = () => {
  useAdminSession();
  const { data: students, isLoading } = api.student.get.useQuery();
  const removeStudent = api.student.delete.useMutation();
  const apiUtils = api.useContext();

  const { modalProps, setModalData, setModalVisibility } = useModal();

  if (isLoading || !students)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  const tableProps = createTableProps({
    data: students,
    options: {
      header: "Студенти",
      showActions: true,
      enableSearch: true,
      canRemove: true,
      createOnNewPage: "students/create",
    },
    columnDefinitions: [
      {
        header: "ПІБ",
        key: "name",
        isMain: true,
        customElement: (row) => <Link href={`students/${row.id}`}>{row.name}</Link>,
      },
      { header: "Електронна адреса", key: "email" },
      { header: "Факультет", key: "faculty" },
      { header: "Група", key: "group" },
      {
        header: "Статус",
        key: "isRequested",
        searchBy: false,
        customElement: (row) => (
          <div className="flex gap-1">
            <SeniorBadge isVisible={row.seniorOf} />
            <RequestedBadge isVisible={row.isRequested} />
            <ConfirmedBadge isVisible={row.isConfirmed} />
          </div>
        ),
      },
    ],
    onRowRemove: (row) =>
      setModalData({
        text: `Видалити студента ${row.name}`,
        isVisible: true,
        onAccept: () => handleRemove(row.id),
      }),
  });

  const handleRemove = (id: number) => {
    setModalVisibility(false);
    removeStudent.mutate(id, {
      onSuccess: () =>
        apiUtils.student.get.setData(undefined, (old) =>
          old ? old.filter((s) => s.id !== id) : old
        ),
    });
  };

  return (
    <main className="mx-auto w-full max-w-[85rem] p-2.5">
      <Head>
        <title>Студенти</title>
      </Head>
      <DataTable {...tableProps} />
      <ConfirmModal {...modalProps} />
    </main>
  );
};

Students.getLayout = (page) => <>{page}</>;

export default Students;
