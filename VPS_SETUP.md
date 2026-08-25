# VPS setup

This setup runs the Playwright court checker every five minutes using a systemd timer. Checks before 06:30 Europe/Amsterdam are skipped, matching the existing GitHub Actions quiet-hours behavior.

## Recommended server

Ubuntu 22.04 with at least 2 GB RAM. Chromium/Playwright is the main reason to prefer 2 GB over a smaller VPS, and Ubuntu 22.04 is the closest fit for this repository's older Playwright version.

## 1. Create a dedicated user and clone the repository

```bash
sudo useradd --system --create-home --shell /bin/bash padel
sudo mkdir -p /opt/playwright-cloud-tests /var/log/padel-booker
sudo chown -R padel:padel /opt/playwright-cloud-tests /var/log/padel-booker
sudo -u padel git clone https://github.com/aarontom92/playwright-cloud-tests.git /opt/playwright-cloud-tests
cd /opt/playwright-cloud-tests
sudo -u padel git checkout main
```

After this PR is merged, `main` contains the VPS files.

## 2. Install Node.js dependencies and Playwright Chromium

Install a current Node.js LTS release first, then:

```bash
cd /opt/playwright-cloud-tests
sudo -u padel npm ci
sudo npx playwright install-deps chromium
sudo -u padel npx playwright install chromium
```

The OS-level browser dependencies need root privileges, while the Chromium browser itself is installed as the `padel` user so the systemd service can find it later.

## 3. Configure credentials

Copy the example file outside the repository:

```bash
sudo cp /opt/playwright-cloud-tests/deploy/padel-booker.env.example /etc/padel-booker.env
sudo chmod 600 /etc/padel-booker.env
sudo nano /etc/padel-booker.env
```

Replace the placeholder values with the same credentials currently stored as GitHub Actions secrets. Never commit `/etc/padel-booker.env` or real credentials to GitHub.

## 4. Install the systemd units

```bash
sudo cp /opt/playwright-cloud-tests/deploy/padel-booker.service /etc/systemd/system/
sudo cp /opt/playwright-cloud-tests/deploy/padel-booker.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now padel-booker.timer
```

The timer starts two minutes after boot and then triggers every five minutes. The oneshot service prevents overlapping instances: systemd will not start another copy while the previous invocation of the same service is still active.

## 5. Verify

```bash
systemctl status padel-booker.timer
systemctl list-timers padel-booker.timer
sudo systemctl start padel-booker.service
journalctl -u padel-booker.service -n 100 --no-pager
```

Per-run output is also written to `/var/log/padel-booker/`.

## Updating code later

```bash
cd /opt/playwright-cloud-tests
sudo -u padel git pull --ff-only
sudo -u padel npm ci
```

The next timer run automatically uses the updated code.

## Normal vs actual failure

The wrapper treats `Geen beschikbare baan gevonden` as a normal polling result and exits successfully. Login failures, selector/site changes, browser crashes, and other Playwright failures still return a non-zero exit code and appear as failed systemd runs.
