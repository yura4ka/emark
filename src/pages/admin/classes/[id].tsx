import { Spinner } from "flowbite-react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import SubmitButton from "../../../components/Buttons/SubmitButton";
import MyInput from "../../../components/Inputs/MyInput";
import SubGroupModal from "../../../components/Modals/SubGroupModal";
import MySelect from "../../../components/MySelect";
import useAdminSession from "../../../hooks/useAdminSession";
import { api } from "../../../utils/api";
import { HiCog } from "react-icons/hi";
import { Breadcrumb, BreadcrumbItem } from "../../../components/Breadcrumb";
import Link from "next/link";

function initiateClassData() {
  return {
    id: -1,
    name: "",
    faculty: { id: -1, title: "" },
    group: { id: -1, name: "" },
    subGroup: { id: -1, name: "", isFull: false },
    teacher: { id: -1, name: "" },
    subject: { id: -1, title: "" },
  };
}

const Class: NextPage = () => {
  useAdminSession();
  const router = useRouter();
  const id = +(router.query.id || -1) || -1;
  const dbClass = api.class.getById.useQuery(id, { enabled: id > 0 });
  const createClass = api.class.create.useMutation();
  const updateClass = api.class.update.useMutation();

  const [classData, setClassData] = useState(dbClass.data || initiateClassData());
  function setData(data: unknown, field: keyof typeof classData) {
    setClassData((prev) => ({ ...prev, [field]: data }));
  }

  useEffect(() => {
    if (dbClass.data) setClassData(dbClass.data);
    if (dbClass.isError) void router.push("/");
  }, [dbClass.data, dbClass.isError, router]);

  const { data: subjects } = api.subject.get.useQuery();
  const { data: teachers } = api.teacher.get.useQuery();
  const { data: faculties } = api.faculty.get.useQuery();
  const groups = api.faculty.getGroups.useQuery(
    { id: classData.faculty.id },
    { enabled: classData.faculty.id > 0 }
  );
  const subGroups = api.subGroup.get.useQuery(classData.group.id, {
    enabled: classData.group.id > 0,
  });
  const { data: groupStudents } = api.group.getStudents.useQuery(classData.group.id, {
    enabled: classData.group.id > 0,
  });
  const { data: subGroupStudents } = api.subGroup.getById.useQuery(
    classData.subGroup.id,
    { enabled: classData.subGroup.id > 0 }
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreatingSub, setCreatingSub] = useState(true);

  const modalStudents = useMemo(() => {
    if (isCreatingSub) return [];
    return subGroupStudents?.students || [];
  }, [isCreatingSub, subGroupStudents]);

  if ((dbClass.isLoading && id > 0) || !teachers || !faculties || !subjects)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  const isReady =
    classData.name.trim().length !== 0 &&
    classData.subject.id > 0 &&
    classData.teacher.id > 0 &&
    classData.subGroup.id > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (id <= 0)
      createClass.mutate(classData, {
        onSuccess(data) {
          void router.push(`./${data.id}?created=true`);
        },
      });
    else updateClass.mutate({ id, ...classData });
  }

  return (
    <div className="mx-auto max-w-xl">
      <Head>
        <title>{id === -1 ? "Створити клас" : "Редагувати клас"}</title>
      </Head>

      <Breadcrumb className="mb-6">
        <BreadcrumbItem href="/" icon={HiCog}>
          Сторінка адміністратора
        </BreadcrumbItem>
        <BreadcrumbItem href="./">Класи</BreadcrumbItem>
        <BreadcrumbItem>{dbClass.data?.name || "Створити"}</BreadcrumbItem>
      </Breadcrumb>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {id === -1 ? "Створити " : "Редагувати "}клас
        </h1>
        {id !== -1 && (
          <Link
            href={"./create"}
            className="text-xs font-medium text-blue-700 hover:text-blue-800 dark:text-blue-600 dark:hover:text-blue-700"
          >
            створити інший
          </Link>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-2">
        <MyInput
          label="Назва"
          value={classData.name}
          setValue={(value) => setData(value, "name")}
          additional="Рекомендований формат: [Предмет] [Група] [теорія / практика]"
        />
        <MySelect
          label="Виберіть предмет"
          options={subjects}
          field="title"
          value={classData.subject}
          setValue={(value) => setData(value, "subject")}
          showBlank={true}
          errorText={{ title: "", text: "Не знайдено жодного предмета!" }}
        />
        <MySelect
          label="Виберіть викладача"
          options={teachers}
          field="name"
          value={classData.teacher}
          setValue={(value) => setData(value, "teacher")}
          showBlank={true}
          errorText={{ title: "", text: "Не знайдено жодного викладача!" }}
        />
        <MySelect
          label="Виберіть факультет"
          options={faculties}
          field="title"
          value={classData.faculty}
          setValue={(value) => {
            setData(value, "faculty");
            setData({ id: -1, name: "" }, "group");
            setData({ id: -1, name: "" }, "subGroup");
          }}
          showBlank={true}
          errorText={{ title: "", text: "Не знайдено жодного факультету!" }}
        />
        <MySelect
          label="Виберіть групу"
          isVisible={classData.faculty.id > 0}
          isLoading={groups.isLoading}
          options={groups.data || []}
          field="name"
          value={classData.group}
          setValue={(value) => {
            setData(value, "group");
            setData({ id: -1, name: "" }, "subGroup");
          }}
          showBlank={true}
          errorText={{ title: "", text: "Не знайдено жодної групи!" }}
        />
        <MySelect
          label="Виберіть підгрупу"
          isVisible={classData.group.id > 0}
          isLoading={subGroups.isLoading}
          options={subGroups.data || []}
          field="name"
          value={classData.subGroup}
          setValue={(value) => setData(value, "subGroup")}
          showBlank={true}
          errorText={{ title: "", text: "Не знайдено жодної підгрупи!" }}
        />
        {classData.group.id > 0 && (
          <button
            type="button"
            onClick={() => {
              setCreatingSub(true);
              setIsModalVisible(true);
            }}
            className="mt-[-5px] w-fit cursor-pointer text-xs font-medium text-blue-700 hover:text-blue-800  focus:outline-none dark:text-blue-600 dark:hover:text-blue-700"
          >
            Створити нову підгрупу
          </button>
        )}
        {classData.group.id > 0 && !classData.subGroup.isFull && (
          <button
            type="button"
            onClick={() => {
              setCreatingSub(false);
              setIsModalVisible(true);
            }}
            className="mb-2 mt-[-5px] w-fit cursor-pointer text-xs font-medium text-blue-700 hover:text-blue-800  focus:outline-none dark:text-blue-600 dark:hover:text-blue-700"
          >
            Редагувати підгрупу
          </button>
        )}
        <div
          className={`transition-opacity duration-300 ${
            !isReady ? "opacity-0" : "opacity-1"
          }`}
        >
          <SubmitButton
            disabled={!isReady}
            isLoading={createClass.isLoading || updateClass.isLoading}
            text={id === -1 ? "Створити" : "Зберегти"}
          />
        </div>
      </form>
      {router.query.created && !updateClass.isSuccess && (
        <>
          <p className="text-sm text-green-600 dark:text-green-500">
            Клас успішно створено!
          </p>
        </>
      )}
      {updateClass.isSuccess && (
        <p className="text-sm text-green-600 dark:text-green-500">
          Клас успішно змінено!
        </p>
      )}
      {(createClass.isError || updateClass.isError) && (
        <p className="text-sm text-red-600 dark:text-red-500">
          Відбулася помилка при {id <= 0 ? "створенні" : "зміні"} класу!
        </p>
      )}
      {groupStudents && (isCreatingSub || !classData.subGroup.isFull) && (
        <SubGroupModal
          group={groupStudents.students}
          subGroupStudents={modalStudents}
          isVisible={isModalVisible}
          setVisible={setIsModalVisible}
          groupId={classData.group.id}
          subGroup={classData.subGroup}
          isCreating={isCreatingSub}
        />
      )}
    </div>
  );
};

export default Class;
