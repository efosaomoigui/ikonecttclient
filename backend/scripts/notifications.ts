import { createApp } from '../src/bootstrap';
import { NotificationsService } from '../src/notifications/notifications.service';
async function main() {
  const app = await createApp(true);
  await app.init();
  try {
    const service = app.get(NotificationsService);
    // Bounded worker invocation for a scheduler; delivery payloads are never printed.
    let processed = 0;
    for (let i = 0; i < 100; i++) { const result = await service.dispatchOne(); if (!result.processed) break; processed++; }
    console.log(JSON.stringify({ processed }));
  } finally { await app.close(); }
}
main().catch(() => { console.error('Notification worker failed'); process.exitCode = 1; });
