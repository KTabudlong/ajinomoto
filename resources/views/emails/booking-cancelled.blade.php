<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Booking Cancelled</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #dc2626;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 0 0 8px 8px;
        }
        .booking-details {
            background-color: white;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #dc2626;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Booking Cancelled</h1>
    </div>
    
    <div class="content">
        @if($cancelledBy === 'tutor')
            <p>Dear {{ $customer->name }},</p>
            
            <p>We regret to inform you that your booking has been cancelled by your tutor.</p>
        @else
            <p>Dear {{ $schedule->tutor->name }},</p>
            
            <p>We regret to inform you that a student has cancelled their booking with you.</p>
        @endif
        
        <div class="booking-details">
            <h3>Booking Details:</h3>
            <p><strong>Subject:</strong> {{ $subject->name }}</p>
            @if($topic)
                <p><strong>Topic:</strong> {{ $topic->name }}</p>
            @endif
            <p><strong>Date:</strong> {{ \Carbon\Carbon::parse($schedule->start_time)->format('l, F j, Y') }}</p>
            <p><strong>Time:</strong> {{ \Carbon\Carbon::parse($schedule->start_time)->format('g:i A') }} - {{ \Carbon\Carbon::parse($schedule->end_time)->format('g:i A') }}</p>
        </div>
        
        @if($cancelledBy === 'tutor')
            <p>If you have any questions about this cancellation, please contact your tutor directly.</p>
        @else
            <p>If you have any questions about this cancellation, please contact the student directly.</p>
        @endif
        
        <p>We apologize for any inconvenience this may have caused.</p>
        
        <p>Best regards,<br>
        The Tutor Booking Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html> 