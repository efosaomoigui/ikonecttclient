import { SwaggerModule } from '@nestjs/swagger';
import { Config } from './core/config';
import { createApp, openApi } from './bootstrap';
async function main() {
  const app = await createApp();
  const config = app.get(Config);
  if (config.values.NODE_ENV !== 'production') SwaggerModule.setup('api/docs', app, openApi(app));
  await app.listen(config.values.PORT, config.values.HOST);
  console.log(JSON.stringify({ event: 'listening', address: await app.getUrl() }));
}
main().catch(error => { console.error(error instanceof Error ? error.message.replace(/postgres(?:ql)?:\/\/[^\s]+/g, '[database URL redacted]') : 'Startup failed'); process.exitCode = 1; });
