<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\User;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\Schedule;
use App\Models\DeliveryType;
use App\Models\OrderStatus;
use Illuminate\Console\Command;

class TestBookings extends Command
{
    protected $signature = 'test:bookings';
    protected $description = 'Test the bookings system by creating a test order';

    public function handle()
    {
        $this->info('=== Testing Bookings System ===');

        // Check if there are any orders
        $orders = Order::all();
        $this->info("Total orders in database: " . $orders->count());

        if ($orders->count() == 0) {
            $this->info('No orders found. Creating test order...');
            
            // Get required data
            $teacher = User::where('role_id', 1)->first();
            $customer = User::where('role_id', 2)->first();
            $subject = Subject::first();
            $topic = Topic::first();
            $schedule = Schedule::first();
            $deliveryType = DeliveryType::first();
            $orderStatus = OrderStatus::first();
            
            if (!$teacher || !$customer || !$subject || !$schedule || !$deliveryType || !$orderStatus) {
                $this->error('Missing required data:');
                $this->line("Teacher: " . ($teacher ? 'Found' : 'Missing'));
                $this->line("Customer: " . ($customer ? 'Found' : 'Missing'));
                $this->line("Subject: " . ($subject ? 'Found' : 'Missing'));
                $this->line("Topic: " . ($topic ? 'Found' : 'Missing'));
                $this->line("Schedule: " . ($schedule ? 'Found' : 'Missing'));
                $this->line("DeliveryType: " . ($deliveryType ? 'Found' : 'Missing'));
                $this->line("OrderStatus: " . ($orderStatus ? 'Found' : 'Missing'));
                return 1;
            }
            
            // Create test order
            $order = Order::create([
                'schedule_id' => $schedule->id,
                'customer_id' => $customer->id,
                'subject_id' => $subject->id,
                'topic_id' => $topic ? $topic->id : null,
                'delivery_type_id' => $deliveryType->id,
                'order_status_id' => $orderStatus->id,
                'teacher_comment' => 'Test teacher comment',
                'customer_comment' => 'Test customer comment',
            ]);
            
            $this->info("Test order created with ID: " . $order->id);
            $this->line("Schedule ID: " . $order->schedule_id);
            $this->line("Customer ID: " . $order->customer_id);
            $this->line("Subject ID: " . $order->subject_id);
            
        } else {
            $this->info('Orders found. First order details:');
            $firstOrder = $orders->first();
            $this->line("Order ID: " . $firstOrder->id);
            $this->line("Schedule ID: " . $firstOrder->schedule_id);
            $this->line("Customer ID: " . $firstOrder->customer_id);
            $this->line("Subject ID: " . $firstOrder->subject_id);
        }

        $this->info('=== End Test ===');
        return 0;
    }
} 