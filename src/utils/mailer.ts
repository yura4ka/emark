import * as nodemailer from "nodemailer";
import { env } from "../env/server.mjs";

type EmailType = "CONFIRM" | "ADMIN_PASSWORD";

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL,
      pass: env.PASSWORD,
    },
  });
}

export function checkIsExpired(date: Date) {
  const maxDate = new Date(date);
  maxDate.setDate(date.getDate() + 1);
  return new Date() > maxDate;
}

export function mailTo(to: string, confirmString: string, type: EmailType) {
  const transporter = createTransporter();
  let html, subject;

  switch (type) {
    case "CONFIRM":
      html = confirmTeacherMarkup(confirmString);
      subject = "Реєстрація в системі Emark";
      break;
    case "ADMIN_PASSWORD":
      html = adminPasswordResetMarkup(confirmString);
      subject = "Скидання пароля | Emark";
      break;
  }

  return transporter.sendMail({
    from: "Emark Admin <no-reply@emark.com>",
    to,
    subject,
    html: embedInHtml(html),
  });
}

const adminPasswordResetMarkup = (link: string) => `
<div>
<h1>Ваш пароль було скинуто адміном Emark</h1>
<p>Ввести новий пароль можна за посиланням. Посилання буде дійсним протягом 24 годин.</p>
<a class='btn' href='http://localhost:3000/auth/confirm-teacher/${link}'>Підтвердити</a>
<p>З повагою, адміністратор <a href='http://localhost:3000/'>Emark.com</a></p>
</div>`;

const confirmTeacherMarkup = (link: string) => `
<div>
<h1>Вас було зареєстровано в системі Emark у ролі викладача</h1>
<p>Підтвердьте акаунт, щоб почати користуватися сервісом. Посилання буде дійсним протягом 24 годин. Якщо ви не мали отримати це повідомлення – проігноруйте його.</p>
<a style="font-weight: 500; font-size: 1.25rem; color: rgb(255, 255, 255); background-color: rgb(26, 86, 219); border-radius: 0.5rem; padding: 0.75rem 1.25rem; margin: 1.25rem auto; display: block; width: fit-content; text-decoration: none; font-family: sans-serif;" href='http://localhost:3000/auth/confirm-teacher/${link}'>Підтвердити</a>
<p>З повагою, адміністратор <a href='http://localhost:3000/'>Emark.com</a></p>
</div>`;

function embedInHtml(html: string) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
    </head>
    ${styles}
    <body>
    ${html}
    </body>
  </html>`;
}

const styles = `<style>
* {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
}
div {
  max-width: 860px;
  padding: 0.5rem;
}
h1 {
  font-size: 2rem;
  letter-spacing: -0.025em;
  line-height: 1;
  padding-bottom: 1rem;
}
p {
  font-size: 1rem;
  line-height: 1.25rem;
  color: rgb(107 114 128);
}
a {
  text-decoration: none;
  color: rgb(26 86 219);
}
</style>`;
