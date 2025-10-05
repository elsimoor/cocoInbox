import { Router } from 'express';
import { MailService } from '../services/mailService';
import { authenticate } from '../middleware/auth';

// Routes for sending and receiving email through external services. Free users
// send via SMTP/smtp.dev and premium users send via Mailchimp. Inbox
// retrieval is implemented for free users via smtp.dev API; premium inbound
// email is not implemented.

const router = Router();
const mailService = new MailService();

// Send an email on behalf of the authenticated user. Requires the user to be
// authenticated via JWT (middleware/auth). Body should include `to` and
// `subject` fields, and optionally `text` and `html`.
router.post('/send', authenticate, async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    if (!to || !subject) {
      return res.status(400).json({ error: 'Recipient and subject are required' });
    }
    // The authenticate middleware attaches the decoded user object to req.user
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await mailService.sendEmail(user, { to, subject, text, html });
    return res.json({ success: true, result });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: error.message || 'Failed to send email' });
  }
});

// Retrieve inbox messages for the authenticated user. Only implemented for
// free tier via smtp.dev. The returned array contains message metadata.
router.get('/inbox', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const messages = await mailService.receiveEmails(user);
    return res.json(messages);
  } catch (error: any) {
    console.error('Error fetching inbox messages:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch messages' });
  }
});

export default router;