import { Spinner } from "flowbite-react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import DataTable, { createTableProps } from "../../../components/DataTable/DataTable";
import useAdminSession from "../../../hooks/useAdminSession";
import { api } from "../../../utils/api";

const Classes: NextPage = () => {
  useAdminSession();
  const { data: classes, isLoading } = api.class.get.useQuery();

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
    },
  });

  return (
    <>
      <Head>
        <title>Класи</title>
      </Head>
      <DataTable {...tableProps} />
    </>
  );
};

export default Classes;
