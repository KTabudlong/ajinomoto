<?php

namespace App\Services;

use App\Mail\BookingCancelledMail;
use App\Models\Order;
use App\Models\OrderStatus;
use Illuminate\Support\Facades\Mail;

class OrderCancellationService
{
    /**
     * Cancel an order with proper authorization and email notifications
     */
    public function cancelOrder(Order $order, int $userId, int $userRoleId): array
    {
        // Check authorization - only tutor or customer can cancel
        $isTutor = $userRoleId === 1;
        $isCustomer = $order->customer_id === $userId;
        
        if (!$isTutor && !$isCustomer) {
            throw new \Exception('You are not authorized to cancel this booking.');
        }

        // Get cancelled status
        $cancelledStatus = OrderStatus::where('name', 'cancelled')->first();
        
        if (!$cancelledStatus) {
            throw new \Exception('Cancelled status not found.');
        }

        // Update order status to cancelled
        $order->update(['order_status_id' => $cancelledStatus->id]);

        // Send appropriate email notification
        if ($isTutor) {
            $this->sendTutorCancellationEmail($order);
            $message = 'Booking cancelled successfully. Customer has been notified.';
        } else {
            $this->sendCustomerCancellationEmail($order);
            $message = 'Booking cancelled successfully. Tutor has been notified.';
        }

        return [
            'success' => true,
            'message' => $message,
            'isTutor' => $isTutor,
        ];
    }

    /**
     * Send cancellation email when tutor cancels (to customer)
     */
    private function sendTutorCancellationEmail(Order $order): void
    {
        // Load the customer relationship
        $order->load('customer', 'schedule', 'subject', 'topic');

        // Send email notification to customer
        Mail::to($order->customer->email)->send(new BookingCancelledMail($order, 'tutor'));
    }

    /**
     * Send cancellation email when customer cancels (to tutor)
     */
    private function sendCustomerCancellationEmail(Order $order): void
    {
        // Load the tutor relationship
        $order->load('schedule.tutor', 'schedule', 'subject', 'topic');

        // Send email notification to tutor
        Mail::to($order->schedule->tutor->email)->send(new BookingCancelledMail($order, 'customer'));
    }

    /**
     * Test cancellation emails without actually cancelling the booking
     */
    public function testCancellationEmails(Order $order): void
    {
        // Test tutor cancellation email (to customer)
        $this->sendTutorCancellationEmail($order);
        
        // Test customer cancellation email (to tutor)
        $this->sendCustomerCancellationEmail($order);
    }
} 