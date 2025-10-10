// @ts-check
const { test, expect } = require("@playwright/test");

// usernames & passwords
const usernameAaron = "arontom@hotmail.com";
const passwordAaron = "Newbegin92!";
const usernameReinier = "rt@westerduin.nl";
const passwordReinier = "Timotheus007!";

// tijdstippen
const threePM = 17;
const fourPM = 19;
const fivePM = 21;
const sixPM = 23;
const sevenPM = 25;
const eightPM = 27;
const ninePM = 29;

// Eerste test. Probeert de baan van over 14 dagen te pakken om 20:00
test("test1", async ({ page }) => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 0);
  const day = String(currentDate.getDate()).padStart(2, "0");
  const url = `https://tesqua.aqqo.com/planboard?date=${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${day}`;
  await page.goto("https://tesqua.aqqo.com/auth/notauthenticated");
  await page
    .locator("#contentlayout")
    .getByRole("link", { name: "Inloggen" })
    .click();
  await page.getByPlaceholder("E-mailadres").click();
  await page.getByPlaceholder("E-mailadres").fill(usernameAaron);
  await page.getByPlaceholder("E-mailadres").press("Tab");
  await page.getByPlaceholder("Wachtwoord").click();
  await page.getByPlaceholder("Wachtwoord").fill(passwordAaron);
  await page.getByRole("button", { name: "Inloggen" }).click();
  await page.getByRole("link", { name: "Toon Dag Weergave" }).click();
  await page.goto(url);
  await page
    .locator(
      `div:nth-child(7) > div:nth-child(2) > .planboard-booking-raster > div:nth-child(${eightPM})`
    )
    .click();
  await page.getByRole("button", { name: "Reserveren" }).click();
  await page.waitForTimeout(2000);
  await page
    .getByRole("button", {
      name: "Ga naar de volgende stap om je voorkeuren te selecteren",
    })
    .click();
  await page.locator("#public_user_id_23_0").click();
  await page.getByRole("listitem").filter({ hasText: "Ruth Hoving" }).click();
  await page.waitForTimeout(1000);
  await page.locator("#public_user_id_23_1").click();
  await page
    .getByRole("listitem")
    .filter({ hasText: "Marijke Westerduin" })
    .click();
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByText("Ik ga akkoord met de").click();
  await page.waitForTimeout(1000);
  await page
    .getByRole("button", {
      name: "Ga naar de volgende stap om de betaling van je reservering te voldoen",
    })
    .click();
  await page.screenshot({ path: "screenshot.png", fullPage: true });
  await page.waitForTimeout(2000);
});

// Tweede test. Probeert de baan van over 14 dagen te pakken om 21:00

test("test2", async ({ page }) => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 14);
  const day = String(currentDate.getDate()).padStart(2, "0");
  const url = `https://tesqua.aqqo.com/planboard?date=${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${day}`;
  await page.goto("https://tesqua.aqqo.com/auth/notauthenticated");
  await page
    .locator("#contentlayout")
    .getByRole("link", { name: "Inloggen" })
    .click();
  await page.getByPlaceholder("E-mailadres").click();
  await page.getByPlaceholder("E-mailadres").fill(usernameAaron);
  await page.getByPlaceholder("E-mailadres").press("Tab");
  await page.getByPlaceholder("Wachtwoord").click();
  await page.getByPlaceholder("Wachtwoord").fill(passwordAaron);
  await page.getByRole("button", { name: "Inloggen" }).click();
  await page.getByRole("link", { name: "Toon Dag Weergave" }).click();
  await page.goto(url);
  await page
    .locator(
      `div:nth-child(7) > div:nth-child(2) > .planboard-booking-raster > div:nth-child(${ninePM})`
      //27 is de baan van 20:00, //29 van 21:00
    )
    .click();
  await page.getByRole("button", { name: "Reserveren" }).click();
  await page.waitForTimeout(2000);
  await page
    .getByRole("button", {
      name: "Ga naar de volgende stap om je voorkeuren te selecteren",
    })
    .click();
  await page.locator("#public_user_id_23_0").click();
  await page.getByRole("listitem").filter({ hasText: "Ruth Hoving" }).click();
  await page.waitForTimeout(1000);
  await page.locator("#public_user_id_23_1").click();
  await page
    .getByRole("listitem")
    .filter({ hasText: "Marijke Westerduin" })
    .click();
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByText("Ik ga akkoord met de").click();
  await page.waitForTimeout(1000);
  await page
    .getByRole("button", {
      name: "Ga naar de volgende stap om de betaling van je reservering te voldoen",
    })
    .click();
  await page.screenshot({ path: "screenshot.png", fullPage: true });
  await page.waitForTimeout(2000);
});

// derde test, probeert het met Reiniers account om 20:00
test("test3", async ({ page }) => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 14);
  const day = String(currentDate.getDate()).padStart(2, "0");
  const url = `https://tesqua.aqqo.com/planboard?date=${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${day}`;
  await page.goto("https://tesqua.aqqo.com/auth/notauthenticated");
  await page
    .locator("#contentlayout")
    .getByRole("link", { name: "Inloggen" })
    .click();
  await page.getByPlaceholder("E-mailadres").click();
  await page.getByPlaceholder("E-mailadres").fill(usernameReinier);
  await page.getByPlaceholder("E-mailadres").press("Tab");
  await page.getByPlaceholder("Wachtwoord").click();
  await page.getByPlaceholder("Wachtwoord").fill(passwordReinier);
  await page.getByRole("button", { name: "Inloggen" }).click();
  await page.getByRole("link", { name: "Toon Dag Weergave" }).click();
  await page.goto(url);
  await page
    .locator(
      `div:nth-child(7) > div:nth-child(2) > .planboard-booking-raster > div:nth-child(${eightPM})`
      //27 is de baan van 20:00, //29 van 21:00
    )
    .click();
  await page.getByRole("button", { name: "Reserveren" }).click();
  await page.waitForTimeout(2000);
  await page
    .getByRole("button", {
      name: "Ga naar de volgende stap om je voorkeuren te selecteren",
    })
    .click();
  await page.locator("#public_user_id_23_0").click();
  await page.getByRole("listitem").filter({ hasText: "Hazelhekke" }).click();
  await page.waitForTimeout(1000);
  await page.locator("#public_user_id_23_1").click();
  await page
    .getByRole("listitem")
    .filter({ hasText: "Marijke Westerduin" })
    .click();
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByText("Ik ga akkoord met de").click();
  await page.waitForTimeout(1000);
  await page
    .getByRole("button", {
      name: "Ga naar de volgende stap om de betaling van je reservering te voldoen",
    })
    .click();
  await page.screenshot({ path: "screenshot.png", fullPage: true });
  await page.waitForTimeout(2000);
});

// Vierde test, probeert het met reiniers account. Nu om 21:00

test("test4", async ({ page }) => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 14);
  const day = String(currentDate.getDate()).padStart(2, "0");
  const url = `https://tesqua.aqqo.com/planboard?date=${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${day}`;
  await page.goto("https://tesqua.aqqo.com/auth/notauthenticated");
  await page
    .locator("#contentlayout")
    .getByRole("link", { name: "Inloggen" })
    .click();
  await page.getByPlaceholder("E-mailadres").click();
  await page.getByPlaceholder("E-mailadres").fill(usernameReinier);
  await page.getByPlaceholder("E-mailadres").press("Tab");
  await page.getByPlaceholder("Wachtwoord").click();
  await page.getByPlaceholder("Wachtwoord").fill(passwordReinier);
  await page.getByRole("button", { name: "Inloggen" }).click();
  await page.getByRole("link", { name: "Toon Dag Weergave" }).click();
  await page.goto(url);
  await page
    .locator(
      `div:nth-child(7) > div:nth-child(2) > .planboard-booking-raster > div:nth-child(${ninePM})`
      //27 is de baan van 20:00, //29 van 21:00
    )
    .click();
  await page.getByRole("button", { name: "Reserveren" }).click();
  await page.waitForTimeout(2000);
  await page
    .getByRole("button", {
      name: "Ga naar de volgende stap om je voorkeuren te selecteren",
    })
    .click();
  await page.locator("#public_user_id_23_0").click();
  await page.getByRole("listitem").filter({ hasText: "Hazelhekke" }).click();
  await page.waitForTimeout(1000);
  await page.locator("#public_user_id_23_1").click();
  await page
    .getByRole("listitem")
    .filter({ hasText: "Marijke Westerduin" })
    .click();
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByText("Ik ga akkoord met de").click();
  await page.waitForTimeout(1000);
  await page
    .getByRole("button", {
      name: "Ga naar de volgende stap om de betaling van je reservering te voldoen",
    })
    .click();
  await page.screenshot({ path: "screenshot.png", fullPage: true });
  await page.waitForTimeout(2000);
});

// Vijfde test, nu met reiniers account met Bjorn en Harmen om 20:00

test("test5", async ({ page }) => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 14);
  const day = String(currentDate.getDate()).padStart(2, "0");
  const url = `https://tesqua.aqqo.com/planboard?date=${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${day}`;
  await page.goto("https://tesqua.aqqo.com/auth/notauthenticated");
  await page
    .locator("#contentlayout")
    .getByRole("link", { name: "Inloggen" })
    .click();
  await page.getByPlaceholder("E-mailadres").click();
  await page.getByPlaceholder("E-mailadres").fill(usernameReinier);
  await page.getByPlaceholder("E-mailadres").press("Tab");
  await page.getByPlaceholder("Wachtwoord").click();
  await page.getByPlaceholder("Wachtwoord").fill(passwordReinier);
  await page.getByRole("button", { name: "Inloggen" }).click();
  await page.getByRole("link", { name: "Toon Dag Weergave" }).click();
  await page.goto(url);
  await page
    .locator(
      `div:nth-child(7) > div:nth-child(2) > .planboard-booking-raster > div:nth-child(${eightPM})`
      //27 is de baan van 20:00, //29 van 21:00
    )
    .click();
  await page.getByRole("button", { name: "Reserveren" }).click();
  await page.waitForTimeout(2000);
  await page
    .getByRole("button", {
      name: "Ga naar de volgende stap om je voorkeuren te selecteren",
    })
    .click();
  await page.locator("#public_user_id_23_0").click();
  await page.getByRole("listitem").filter({ hasText: "Hazelhekke" }).click();
  await page.waitForTimeout(1000);
  await page.locator("#public_user_id_23_1").click();
  await page
    .getByRole("listitem")
    .filter({ hasText: "Harmen Westerduin" })
    .click();
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByText("Ik ga akkoord met de").click();
  await page.waitForTimeout(1000);
  await page
    .getByRole("button", {
      name: "Ga naar de volgende stap om de betaling van je reservering te voldoen",
    })
    .click();
  await page.screenshot({ path: "screenshot.png", fullPage: true });
  await page.waitForTimeout(2000);
});

// Test nummero 6, met reiniers account met Bjorn en Harmen om 21:00

test("test6", async ({ page }) => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 14);
  const day = String(currentDate.getDate()).padStart(2, "0");
  const url = `https://tesqua.aqqo.com/planboard?date=${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${day}`;
  await page.goto("https://tesqua.aqqo.com/auth/notauthenticated");
  await page
    .locator("#contentlayout")
    .getByRole("link", { name: "Inloggen" })
    .click();
  await page.getByPlaceholder("E-mailadres").click();
  await page.getByPlaceholder("E-mailadres").fill(usernameReinier);
  await page.getByPlaceholder("E-mailadres").press("Tab");
  await page.getByPlaceholder("Wachtwoord").click();
  await page.getByPlaceholder("Wachtwoord").fill(passwordReinier);
  await page.getByRole("button", { name: "Inloggen" }).click();
  await page.getByRole("link", { name: "Toon Dag Weergave" }).click();
  await page.goto(url);
  await page
    .locator(
      `div:nth-child(7) > div:nth-child(2) > .planboard-booking-raster > div:nth-child(${ninePM})`
      //27 is de baan van 20:00, //29 van 21:00
    )
    .click();
  await page.getByRole("button", { name: "Reserveren" }).click();
  await page.waitForTimeout(2000);
  await page
    .getByRole("button", {
      name: "Ga naar de volgende stap om je voorkeuren te selecteren",
    })
    .click();
  await page.locator("#public_user_id_23_0").click();
  await page.getByRole("listitem").filter({ hasText: "Hazelhekke" }).click();
  await page.waitForTimeout(1000);
  await page.locator("#public_user_id_23_1").click();
  await page
    .getByRole("listitem")
    .filter({ hasText: "Harmen Westerduin" })
    .click();
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "Volgende stap" }).click();
  await page.getByText("Ik ga akkoord met de").click();
  await page.waitForTimeout(1000);
  await page
    .getByRole("button", {
      name: "Ga naar de volgende stap om de betaling van je reservering te voldoen",
    })
    .click();
  await page.screenshot({ path: "screenshot.png", fullPage: true });
  await page.waitForTimeout(2000);
});
