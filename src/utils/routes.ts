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
  senior: [new NavRoute("/my-class", "Мій клас")],
};

export const TeacherRoutes = {
  basic: [new NavRoute("/", "Групи"), new NavRoute("/subjects", "Предмети")],
  handler: [],
  admin: [
    new NavRoute("/admin/faculties", "Факультети"),
    new NavRoute("/admin/subjects", "Предмети"),
    new NavRoute("/admin/groups", "Групи"),
    new NavRoute("/admin/teachers", "Викладачі"),
    new NavRoute("/admin/students", "Студенти"),
  ],
};
