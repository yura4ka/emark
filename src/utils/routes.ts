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
  senior: [],
};

export const TeacherRoutes = {
  basic: [new NavRoute("/", "Групи"), new NavRoute("/subjects", "Предмети")],
  handler: [],
  admin: [],
};
