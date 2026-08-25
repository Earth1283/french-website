import { expect, test } from '@playwright/test';

const BACKEND_URL = 'https://localhost:8443';
const run = Date.now();

test('teacher creates a class, student joins and completes an assignment', async ({ page, context }) => {
  const teacherEmail = `teacher-${run}@example.com`;
  const studentEmail = `student-${run}@example.com`;

  await page.goto('/#/classes/connect');
  await page.getByPlaceholder('https://192.168.1.42:8443').fill(BACKEND_URL);
  await page.getByRole('button', { name: 'Connect' }).click();

  await expect(page.getByText('Trust this server')).toBeVisible();
  const [healthTab] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('link', { name: 'Open server page' }).click(),
  ]);
  await healthTab.close();
  await page.getByRole('button', { name: "I trusted it — Continue" }).click();

  await expect(page).toHaveURL(/#\/classes\/auth/);
  await page.getByRole('button', { name: "I'm the Teacher" }).click();
  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.getByPlaceholder('Name').fill('Playwright Teacher');
  await page.getByPlaceholder('Email').fill(teacherEmail);
  await page.getByPlaceholder('Password').fill('supersecret1');
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page).toHaveURL(/#\/classes$/);
  await page.getByPlaceholder('New class name, e.g. Period 1').fill('Playwright Class');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Playwright Class')).toBeVisible();

  await page.getByText('Playwright Class').click();
  const joinCode = (await page.locator('span.font-mono').first().innerText()).trim();
  expect(joinCode).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);

  await page.goto('/#/classes/content/new');
  await page.getByPlaceholder('Title').fill('Greetings');
  await page.getByPlaceholder('Prompt').fill('How do you say hello?');
  await page.getByPlaceholder('Correct answer').fill('Bonjour');
  await page.getByPlaceholder('Options, comma-separated (include the correct answer)').fill('Bonjour, Merci, Au revoir');
  await page.getByRole('button', { name: 'Save' }).click();

  await page.goto(`/#/classes`);
  await page.getByText('Playwright Class').click();
  await page.getByRole('button', { name: 'Assign content' }).click();
  await page.getByText('Greetings').click();
  await expect(page.getByText('Greetings')).toBeVisible();

  const studentContext = await page.context().browser()!.newContext({ ignoreHTTPSErrors: true });
  const studentPage = await studentContext.newPage();
  await studentPage.goto('/#/classes/connect');
  await studentPage.getByPlaceholder('https://192.168.1.42:8443').fill(BACKEND_URL);
  await studentPage.getByRole('button', { name: 'Connect' }).click();
  const [studentHealthTab] = await Promise.all([
    studentContext.waitForEvent('page'),
    studentPage.getByRole('link', { name: 'Open server page' }).click(),
  ]);
  await studentHealthTab.close();
  await studentPage.getByRole('button', { name: "I trusted it — Continue" }).click();

  await studentPage.getByRole('button', { name: 'Create Account' }).click();
  await studentPage.getByPlaceholder('Name').fill('Playwright Student');
  await studentPage.getByPlaceholder('Email').fill(studentEmail);
  await studentPage.getByPlaceholder('Password').fill('studentpass1');
  await studentPage.getByRole('button', { name: 'Create Account' }).click();

  await expect(studentPage).toHaveURL(/#\/classes$/);
  await studentPage.getByPlaceholder('Join code, e.g. GEZ6-4F4T').fill(joinCode);
  await studentPage.getByRole('button', { name: 'Join' }).click();
  await expect(studentPage.getByText('Playwright Class')).toBeVisible();
  await expect(studentPage.getByText('Greetings')).toBeVisible();

  await studentPage.getByText('Greetings').click();
  await studentPage.getByRole('button', { name: "Let's go!" }).click();
  await studentPage.getByText('Bonjour', { exact: true }).click();
  await expect(studentPage.getByText('Nice work!')).toBeVisible({ timeout: 5000 });

  await page.goto(`/#/classes`);
  await page.getByText('Playwright Class').click();
  await expect(page.getByText('Playwright Student')).toBeVisible();
  await expect(page.getByText('1/1')).toBeVisible();

  await studentContext.close();
});
