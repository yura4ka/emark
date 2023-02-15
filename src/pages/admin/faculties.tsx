import { Spinner, Table } from "flowbite-react";
import { type GetServerSidePropsContext, type NextPage } from "next";
import FacultyRow from "../../components/InteractiveRows/FacultyRow";
import { getServerAuthSession } from "../../server/auth";
import { api } from "../../utils/api";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);
  if (!session?.user.role.isAdmin)
    return { redirect: { destination: "/", permanent: false } };
  return { props: { user: session.user } };
};

const Faculties: NextPage = () => {
  const { isLoading, data: faculties } = api.faculty.get.useQuery();

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  return (
    <div className="container my-3">
      <h2 className="mb-6 text-2xl font-bold">Факультети</h2>
      <Table>
        <Table.Head>
          <Table.HeadCell>Назва</Table.HeadCell>
          <Table.HeadCell>Дії</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {(faculties || []).map((f) => (
            <FacultyRow key={f.id} id={f.id} title={f.title} />
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};
export default Faculties;
