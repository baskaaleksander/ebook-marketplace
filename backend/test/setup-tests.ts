import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const execPromise = promisify(exec);

beforeAll(async () => {
  try {
    console.log('Resetting test database...');
    await execPromise('npx prisma migrate reset --force --skip-seed --preview-feature');
    console.log('Test database reset complete');
  } catch (error) {
    console.error('Failed to reset test database', error);
    throw error;
  }
});