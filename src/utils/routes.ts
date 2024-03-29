export class NavRoute {
  path: string;
  name: string;

  constructor(path: string, name: string) {
    this.path = path;
    this.name = name;
  }
}

export const UserRoutes = {
  basic: [],
  unauthorized: [
    new NavRoute("/", "Головна"),
    new NavRoute("/auth/sign-in", "Увійти"),
    new NavRoute("/auth/sign-up", "Реєстрація"),
  ],
  authorized: [],
};

export const StudentRoutes = {
  basic: [new NavRoute("/", "Оцінки"), new NavRoute("/subjects", "Предмети")],
  senior: [new NavRoute("/my-class", "Моя група")],
};

export const TeacherRoutes = {
  basic: [new NavRoute("/", "Головна"), new NavRoute("/subjects", "Предмети")],
  handler: [new NavRoute("/my-class", "Моя група")],
  admin: [
    new NavRoute("/admin/faculties", "Факультети"),
    new NavRoute("/admin/subjects", "Предмети"),
    new NavRoute("/admin/groups", "Групи"),
    new NavRoute("/admin/teachers", "Викладачі"),
    new NavRoute("/admin/students", "Студенти"),
    new NavRoute("/admin/classes", "Класи"),
  ],
};
