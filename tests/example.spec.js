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

// Simple step logger to make GH Actions output clearer
/**
 * @template T
 * @param {string} label
 * @param {() => Promise<T>} fn
 * @returns {Promise<T>}
 */
async function logStep(label, fn) {
  const now = new Date().toISOString();
  console.log(`[STEP ${now}] ${label} - start`);
  try {
    const res = await fn();
    console.log(`[STEP ${new Date().toISOString()}] ${label} - ok`);
    return res;
  } catch (e) {
    let msg;
    try {
      const raw = e && e.message ? e.message : String(e);
      msg = raw.length > 300 ? raw.slice(0, 300) + "..." : raw;
    } catch {
      msg = "Unknown error";
    }
    console.log(`[STEP ${new Date().toISOString()}] ${label} - failed: ${msg}`);
    throw e;
  }
}

// Helper: Try to click the first available court/time across 7 days (0..6),
// 3 times (sevenPM, eightPM, ninePM) and 3 courts (as provided locators).
// Returns the combo used if successful.
/**
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<{ dayOffset: number, timeNth: number, court: number }>}
 */
async function tryBookFirstAvailableSlot(page) {
  const timeOptions = [eightPM, ninePM, sevenPM];
  /** @type {Array<{ date: string, dayOffset: number, timeNth: number, court: number, step: string, error: string }>} */
  const attempts = [];
  const shortErr = (e) => {
    try {
      const msg = e && e.message ? e.message : String(e);
      return msg.length > 300 ? msg.slice(0, 300) + "..." : msg;
    } catch {
      return "Unknown error";
    }
  };
  for (const dayOffset of [0, 1, 2, 3, 4, 5, 6]) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${date.getFullYear()}-${month}-${day}`;
    const url = `https://tesqua.aqqo.com/planboard?date=${dateStr}`;
    await page.goto(url);

    for (const timeNth of timeOptions) {
      const courtLocators = [
        // Court 1
        () => page.locator(`div:nth-child(${timeNth})`).first(),
        // Court 2
        () =>
          page
            .locator(
              `div:nth-child(5) > div:nth-child(2) > .planboard-booking-raster > div:nth-child(${timeNth})`
            )
            .first(),
        // Court 3
        () =>
          page
            .locator(
              `div:nth-child(7) > div:nth-child(2) > .planboard-booking-raster > div:nth-child(${timeNth})`
            )
            .first(),
      ];

      for (
        let courtIndex = 0;
        courtIndex < courtLocators.length;
        courtIndex++
      ) {
        const loc = courtLocators[courtIndex]();
        // Step 1: try clicking the slot
        try {
          await loc.click({ timeout: 1000 });
        } catch (e) {
          attempts.push({
            date: dateStr,
            dayOffset,
            timeNth,
            court: courtIndex + 1,
            step: "slot-click",
            error: shortErr(e),
          });
          continue;
        }

        // Step 2: try clicking the reserve button
        const reserveBtn = page.getByRole("button", { name: "Reserveren" });
        try {
          await reserveBtn.click({ timeout: 1500 });
        } catch (e) {
          attempts.push({
            date: dateStr,
            dayOffset,
            timeNth,
            court: courtIndex + 1,
            step: "reserve-click",
            error: shortErr(e),
          });
          continue;
        }

        console.log(
          `Gereserveerd: court ${
            courtIndex + 1
          }, time nth-child(${timeNth}), date ${dateStr} (offset ${dayOffset})`
        );
        return { dayOffset, timeNth, court: courtIndex + 1 };
      }
    }
  }
  console.log("Geen reservering gelukt. Overzicht van pogingen:");
  for (const a of attempts) {
    console.log(
      `[${a.date}] court ${a.court}, nth-child(${a.timeNth}) -> ${a.step} failed: ${a.error}`
    );
  }
  throw new Error(
    `Geen beschikbare baan gevonden. Pogingen: ${attempts.length} combinaties over 7 dagen.`
  );
}

// Eerste test. Probeert de baan van over 14 dagen te pakken om 20:00
test("test1", async ({ page }) => {
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
  // Try across 3 days x 3 times x 3 courts (includes clicking 'Reserveren')
  await tryBookFirstAvailableSlot(page);
  await page.waitForTimeout(2000);
  await logStep("Open voorkeuren-stap", async () => {
    await page
      .getByRole("button", {
        name: "Ga naar de volgende stap om je voorkeuren te selecteren",
      })
      .click();
  });

  await logStep("Selecteer speler 1: Ruth Hoving", async () => {
    await page.locator("#public_user_id_23_0").click();
    await page.getByRole("listitem").filter({ hasText: "Ruth Hoving" }).click();
  });
  await page.waitForTimeout(1000);

  await logStep("Selecteer speler 2: Paul Bosma", async () => {
    await page.locator("#public_user_id_23_1").click();
    await page
      .getByRole("listitem")
      .filter({ hasText: "Paul Bosma" })
      .click();
  });
  await page.waitForTimeout(1000);

  await logStep("Volgende stap", async () => {
    await page.getByRole("button", { name: "Volgende stap" }).click();
  });

  await logStep("Akkoord met voorwaarden", async () => {
    await page.getByText("Ik ga akkoord met de").click();
  });
  await page.waitForTimeout(1000);

  await logStep("Ga naar betaling-stap", async () => {
    await page
      .getByRole("button", {
        name: "Ga naar de volgende stap om de betaling van je reservering te voldoen",
      })
      .click();
  });

  await logStep("Sla screenshot op", async () => {
    await page.screenshot({ path: "screenshot.png", fullPage: true });
  });
  await page.waitForTimeout(2000);
});
/*
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
*/
