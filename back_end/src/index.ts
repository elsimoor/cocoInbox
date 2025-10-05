import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailRoutes from './routes/emailRoutes';
import noteRoutes from './routes/noteRoutes';
import fileRoutes from './routes/fileRoutes';
import authRoutes from './routes/authRoutes';
import mailRoutes from './routes/mailRoutes';
import { connectToDatabase } from './db';

dotenv.config();

async function start() {
  const app = express();
  const db = await connectToDatabase();

  app.use(cors());
  app.use(express.json());

  app.use('/api/emails', emailRoutes);
  app.use('/api/notes', noteRoutes);
  app.use('/api/files', fileRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/mail', mailRoutes);

  // Mount IMAP routes for reading messages from a configured mailbox. These
  // endpoints replicate the behaviour of Hi.zip and allow clients to fetch
  // inbound messages via `/api/get-all`. They use the imap-simple package
  // and environment variables MAIL_USER, MAIL_PASS, MAIL_HOST, MAIL_PORT
  // and MAIL_TLS. See src/routes/imapRoutes.ts for implementation.
  const imapRoutes = (await import('./routes/imapRoutes')).default;
  app.use('/api', imapRoutes);

  // Mount domain management routes. These endpoints allow administrators
  // to configure SMTP domains used for free email sending. See
  // backend/src/routes/domainRoutes.ts for implementation details.
  const domainRoutes = (await import('./routes/domainRoutes')).default;
  app.use('/api/domains', domainRoutes);

  // Mount admin routes for user management and system statistics
  const adminRoutes = (await import('./routes/adminRoutes')).default;
  app.use('/api/admin', adminRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const port = Number(process.env.PORT) || 4000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server ready at http://0.0.0.0:${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});