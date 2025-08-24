<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingCancelledMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $cancelledBy;

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order, $cancelledBy = 'tutor')
    {
        $this->order = $order;
        $this->cancelledBy = $cancelledBy;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->cancelledBy === 'tutor' 
            ? 'Your Booking Has Been Cancelled' 
            : 'A Student Has Cancelled Their Booking';
            
        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.booking-cancelled',
            with: [
                'order' => $this->order,
                'customer' => $this->order->customer,
                'schedule' => $this->order->schedule,
                'subject' => $this->order->subject,
                'topic' => $this->order->topic,
                'cancelledBy' => $this->cancelledBy,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
} 