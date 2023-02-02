export class NavRoute {
  path: string;
  name: string;

  constructor(path: string, name: string) {
    this.path = path;
    this.name = name;
  }
}

export const UserRoutes = {
  basic: [new NavRoute("/", "Головна")],
  unauthorized: [
    new NavRoute("/sign-in", "Увійти"),
    new NavRoute("/sign-up", "Реєстрація"),
  ],
  authorized: [],
};

export const StudentRoutes = {
  basic: [new NavRoute("/", "Оцінки"), new NavRoute("/subjects", "Предмети")],
};

export const TeacherRoutes = {
  basic: [new NavRoute("/", "Групи"), new NavRoute("/subjects", "Предмети")],
};
