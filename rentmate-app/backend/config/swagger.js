import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import { URL } from 'url';

// Load static OpenAPI specification safely in ES Modules environment
const swaggerDocument = JSON.parse(
  fs.readFileSync(new URL('./swagger.json', import.meta.url), 'utf-8')
);

export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerDocument);

export default {
  swaggerServe,
  swaggerSetup,
};
