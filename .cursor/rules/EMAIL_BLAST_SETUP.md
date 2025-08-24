# Email Blast Functionality Setup Guide

## Overview

This email blast system allows tutors to send mass emails to their customers (individuals or groups) with comprehensive tracking and logging.

## Features

- ✅ Role-based access (only tutors can send email blasts)
- ✅ Template system with CRUD operations
- ✅ Individual and group recipient selection
- ✅ Email deduplication (no duplicate emails to same user)
- ✅ Per-recipient status tracking (queued/sent/failed)
- ✅ Email throttling and job-based processing
- ✅ Comprehensive logging and reporting
- ✅ Search and filter capabilities
- ✅ Pagination support

## Database Tables

The following tables have been created:

- `email_blast_statuses` - Status tracking (Queued, Sending, Completed, Failed)
- `email_blast_templates` - Reusable email templates
- `email_blasts` - Main email blast records
- `email_blast_recipients` - Individual recipient tracking

## Setup Instructions

### 1. Database Setup

The migrations have already been run and seeded. The system includes:

- Email blast statuses (Queued, Sending, Completed, Failed)
- Proper foreign key relationships

### 2. Mail Configuration

Configure your mail settings in `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@domain.com
MAIL_FROM_NAME="${APP_NAME}"
```

### 3. Queue Configuration

For background email processing, configure your queue in `.env`:

```env
QUEUE_CONNECTION=database
```

Run queue workers:

```bash
php artisan queue:work
```

### 4. Access Control

- Only users with `role_id = 1` (tutor role) can access email blast functionality
- Navigation link appears automatically for tutors
- All operations are protected by policies

## Usage Flow

### 1. Create Email Blast

1. Navigate to "Email Blasts" in the navigation
2. Click "Send Email Blast"
3. Fill in subject and body (with optional template selection)
4. Optionally save as template for future use
5. Click "Continue"

### 2. Select Recipients

1. Choose individual customers and/or groups
2. System automatically deduplicates recipients
3. Review recipient count
4. Click "Continue"

### 3. Preview and Send

1. Review email content and recipients
2. Click "Send Email Blast"
3. System queues emails for background processing

### 4. Monitor Progress

1. View email blast history in the index page
2. Check individual recipient status in the show page
3. Monitor queue progress

## Template Management

- Create reusable email templates
- Templates are tutor-specific
- Full CRUD operations available
- Templates can be used when creating new email blasts

## API Endpoints

### Email Blasts

- `GET /email-blasts` - Index page
- `GET /email-blasts/create` - Create form
- `POST /email-blasts` - Store email blast
- `GET /email-blasts/{id}/recipients` - Recipients selection
- `POST /email-blasts/{id}/recipients` - Store recipients
- `GET /email-blasts/{id}/preview` - Preview page
- `POST /email-blasts/{id}/send` - Send email blast
- `GET /email-blasts/{id}` - Show details
- `DELETE /email-blasts/{id}` - Delete email blast

### Email Templates

- `GET /email-blast-templates` - Index page
- `GET /email-blast-templates/create` - Create form
- `POST /email-blast-templates` - Store template
- `GET /email-blast-templates/{id}/edit` - Edit form
- `PUT /email-blast-templates/{id}` - Update template
- `DELETE /email-blast-templates/{id}` - Delete template

## Security Features

- Role-based middleware protection
- Policy-based authorization
- Input validation with FormRequest classes
- SQL injection protection
- XSS protection (HTML content is properly escaped)

## Performance Features

- Email throttling (10 emails per second)
- Background job processing
- Database indexing on foreign keys
- Pagination for large datasets
- Efficient query optimization

## Troubleshooting

### Common Issues

1. **Emails not sending**: Check queue workers are running
2. **Permission denied**: Ensure user has tutor role (role_id = 1)
3. **Foreign key errors**: Ensure all migrations are run in correct order
4. **Template not loading**: Check if templates exist for the tutor

### Debug Commands

```bash
# Check queue status
php artisan queue:work --verbose

# Clear failed jobs
php artisan queue:flush

# Check email blast status
php artisan tinker
>>> App\Models\EmailBlast::with('status')->get()
```

## Customization

- Modify email templates in `resources/views/emails/email-blast.blade.php`
- Adjust throttling in `app/Jobs/SendEmailBlastJob.php`
- Customize status colors in React components
- Add new recipient types by extending the system

## Support

For issues or questions, check the Laravel logs in `storage/logs/laravel.log` and the queue logs for detailed error information.
