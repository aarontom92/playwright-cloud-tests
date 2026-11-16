// @ts-check
const { test, expect } = require("@playwright/test");

// usernames & passwords via environment (safe for public repos)
// Avoid direct 'process' reference so @ts-check doesn't require Node types
const ENV = /** @type {any} */ (globalThis).process?.env || {};
const usernameAaron = ENV.PW_USER_AARON;
const passwordAaron = ENV.PW_PASS_AARON;
const usernameReinier = ENV.PW_USER_REINIER;
const passwordReinier = ENV.PW_PASS_REINIER;

if (!usernameAaron || !passwordAaron || !usernameReinier || !passwordReinier) {
  throw new Error(
    "Missing required env vars: PW_USER_AARON, PW_PASS_AARON, PW_USER_REINIER, PW_PASS_REINIER"
  );
}

// tijdstippen
const eightAM = 3;
const nineAM = 5;
const tenAM = 7;
const elevenAM = 9;
const twelveAM = 11;
const onePM = 13;
const twoPM = 15;
const threePM = 17;
const fourPM = 19;
const fivePM = 21;
const sixPM = 23;
const sevenPM = 25;
const eightPM = 27;
const ninePM = 29;

const timeNthToHour = new Map([
  [eightAM, 8],
  [nineAM, 9],
  [tenAM, 10],
  [elevenAM, 11],
  [twelveAM, 12],
  [onePM, 13],
  [twoPM, 14],
  [threePM, 15],
  [fourPM, 16],
  [fivePM, 17],
  [sixPM, 18],
  [sevenPM, 19],
  [eightPM, 20],
  [ninePM, 21],
]);

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

// Helper: Try to click the first available court/time across 8 days (0..7),
// switching time windows for weekdays vs weekends, and 3 courts (as provided locators).
// Day 0 is only eligible if the slot is at least 3 hours from now.
// Returns the combo used if successful.
/**
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<{ dayOffset: number, timeNth: number, court: number }>}
 */
async function tryBookFirstAvailableSlot(page) {
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
  for (const dayOffset of [0, 1, 2, 3, 4, 5, 6, 7]) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const dayOfWeek = date.getDay();
    const timeOptionsByDay = new Map([
      [
        0,
        [
          tenAM
        ],
      ], // Sunday
      [1, [eightPM]], // Monday
      [
        2,
        [eightAM, eightPM],
      ], // Tuesday
      [
        3,
        [eightPM],
      ], // Wednesday
      [4, [eightPM]], // Thursday
      [
        5,
        [
          tenAM,
          elevenAM,
          eightPM,
        ],
      ], // Friday
      [
        6,
        [
          tenAM,
          elevenAM
        ],
      ], // Saturday
    ]);
    const timeOptions = timeOptionsByDay.get(dayOfWeek) || [];
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${date.getFullYear()}-${month}-${day}`;
    const url = `https://tesqua.aqqo.com/planboard?date=${dateStr}&view=day`;

await page.goto(url, {
  waitUntil: "domcontentloaded",
});

console.log("Kalender URL:", page.url());
if (page.url().includes("/auth/")) {
  throw new Error(
    "Niet ingelogd! Kalender stuurt terug naar: " + page.url()
  );
}

try {
  await page.locator(".planboard-booking-raster").first()
    .waitFor({ state: "visible", timeout: 10000 });
} catch {
  console.log("Oude kalenderstructuur niet gevonden!");
}

console.log(
  "Aantal booking rasters:",
  await page.locator(".planboard-booking-raster").count()
);

console.log(
  "Aantal tijdvakken:",
  await page.locator(".planboard-booking-raster > div").count()
);

console.log(
  "Aantal 08:00 elementen:",
  await page.locator(
    ".planboard-booking-raster > div:nth-child(3)"
  ).count()
);

await page.screenshot({
  path: "debug-kalender.png",
  fullPage: true,
});

console.log("Screenshot opgeslagen");


    for (const timeNth of timeOptions) {
      if (dayOffset === 0) {
        const slotHour = timeNthToHour.get(timeNth);
        if (slotHour !== undefined) {
          const slotTime = new Date(date);
          slotTime.setHours(slotHour, 0, 0, 0);
          if (slotTime.getTime() - Date.now() < 4 * 60 * 60 * 1000) {
            continue;
          }
        }
      }
      const courtLocators = [
        // Court 1
        () => page.locator(`.planboard-booking-raster > div:nth-child(${timeNth})`).first(),
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
          await loc.click({ timeout: 3000 });
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

// Geef de website tijd om de login te verwerken
await page.waitForTimeout(3000);

console.log("URL na inloggen:", page.url());

// Maak screenshot van het resultaat
await page.screenshot({
  path: "debug-login.png",
  fullPage: true,
});

console.log("Login screenshot opgeslagen");

// Stop als we nog op een authenticatiepagina staan
if (new URL(page.url()).pathname.startsWith("/auth")) {
  throw new Error(
    "Login niet geslaagd. URL: " + page.url()
  );
}

const selection = await tryBookFirstAvailableSlot(page);


  // Map selected court (1,2,3) to base id (21,22,23)
  const courtBaseId = 20 + selection.court;
  await page.waitForTimeout(2000);
  await logStep("Open voorkeuren-stap", async () => {
    await page
      .getByRole("button", {
        name: "Ga naar de volgende stap om je voorkeuren te selecteren",
      })
      .click();
  });

  await logStep("Selecteer speler 1: Ruth Hoving", async () => {
    await page.locator(`#public_user_id_${courtBaseId}_0`).click();
    await page.getByRole("listitem").filter({ hasText: "Ruth Hoving" }).click();
  });
  await page.waitForTimeout(1000);

  await logStep("Selecteer speler 2: Vincent Lengkeek", async () => {
    await page.locator(`#public_user_id_${courtBaseId}_1`).click();
    await page
      .getByRole("listitem")
      .filter({ hasText: "Vincent Lengkeek" })
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
