<?php

namespace Tests\Unit\Repositories;

use App\Models\Order;
use App\Models\Subject;
use App\Models\User;
use App\Models\Schedule;
use App\Models\OrderStatus;
use App\Repositories\OrderRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class OrderRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private OrderRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new OrderRepository();
    }

    #[Test]
    public function it_returns_paginated_orders_with_default_sorting()
    {
        // Create test data
        $orders = Order::factory()->count(5)->create();

        // Get paginated results
        $result = $this->repository->getPaginatedOrders();

        // Assertions
        $this->assertCount(5, $result->items());
        $this->assertEquals(15, $result->perPage());
        $this->assertEquals(5, $result->total());
        
        // Should be sorted by created_at desc by default
        $this->assertEquals(
            $orders->sortByDesc('created_at')->pluck('id'),
            collect($result->items())->pluck('id')
        );
    }

    #[Test]
    public function it_applies_search_filter_correctly()
    {
        // Create test data
        $subject = Subject::factory()->create(['name' => 'Mathematics']);
        $customer = User::factory()->create(['first_name' => 'John']);
        
        $matchingOrder = Order::factory()->create([
            'subject_id' => $subject->id,
            'customer_id' => $customer->id
        ]);
        
        $nonMatchingOrder = Order::factory()->create();

        // Search for subject name
        $result = $this->repository->getPaginatedOrders(['search' => 'Mathematics']);

        $this->assertCount(1, $result->items());
        $this->assertEquals($matchingOrder->id, $result->items()[0]->id);
    }

    #[Test]
    public function it_applies_customer_search_filter()
    {
        // Create test data
        $customer = User::factory()->create(['first_name' => 'Alice']);
        $matchingOrder = Order::factory()->create(['customer_id' => $customer->id]);
        $nonMatchingOrder = Order::factory()->create();

        // Search for customer name
        $result = $this->repository->getPaginatedOrders(['search' => 'Alice']);

        $this->assertCount(1, $result->items());
        $this->assertEquals($matchingOrder->id, $result->items()[0]->id);
    }

    #[Test]
    public function it_applies_trashed_filter_with_trashed()
    {
        // Create test data
        $activeOrder = Order::factory()->create();
        $deletedOrder = Order::factory()->create();
        $deletedOrder->delete();

        // Get with trashed
        $result = $this->repository->getPaginatedOrders(['trashed' => 'with']);

        $this->assertCount(2, $result->items());
    }

    #[Test]
    public function it_applies_trashed_filter_only_trashed()
    {
        // Create test data
        $activeOrder = Order::factory()->create();
        $deletedOrder = Order::factory()->create();
        $deletedOrder->delete();

        // Get only trashed
        $result = $this->repository->getPaginatedOrders(['trashed' => 'only']);

        $this->assertCount(1, $result->items());
        $this->assertEquals($deletedOrder->id, $result->items()[0]->id);
    }

    #[Test]
    public function it_applies_role_based_filtering_for_non_admin_users()
    {
        // Create test data
        $customer = User::factory()->create(['role_id' => 2]); // Non-admin
        $otherCustomer = User::factory()->create(['role_id' => 2]);
        
        $customerOrder = Order::factory()->create(['customer_id' => $customer->id]);
        $otherOrder = Order::factory()->create(['customer_id' => $otherCustomer->id]);

        // Filter for specific customer (non-admin user)
        $result = $this->repository->getPaginatedOrders([
            'user_id' => $customer->id,
            'user_role_id' => 2
        ]);

        $this->assertCount(1, $result->items());
        $this->assertEquals($customerOrder->id, $result->items()[0]->id);
    }

    #[Test]
    public function it_does_not_filter_for_admin_users()
    {
        // Create test data
        $customer = User::factory()->create(['role_id' => 2]);
        $otherCustomer = User::factory()->create(['role_id' => 2]);
        
        $customerOrder = Order::factory()->create(['customer_id' => $customer->id]);
        $otherOrder = Order::factory()->create(['customer_id' => $otherCustomer->id]);

        // Admin user should see all orders
        $result = $this->repository->getPaginatedOrders([
            'user_id' => 1,
            'user_role_id' => 1 // Admin
        ]);

        $this->assertCount(2, $result->items());
    }

    #[Test]
    public function it_sorts_by_subject_name_correctly()
    {
        // Create test data
        $subjectA = Subject::factory()->create(['name' => 'Algebra']);
        $subjectB = Subject::factory()->create(['name' => 'Biology']);
        $subjectC = Subject::factory()->create(['name' => 'Chemistry']);
        
        $orderC = Order::factory()->create(['subject_id' => $subjectC->id]);
        $orderA = Order::factory()->create(['subject_id' => $subjectA->id]);
        $orderB = Order::factory()->create(['subject_id' => $subjectB->id]);

        // Sort by subject name ascending
        $result = $this->repository->getPaginatedOrders([
            'sort_by' => 'subject',
            'sort_order' => 'asc'
        ]);

        $this->assertEquals($orderA->id, $result->items()[0]->id);
        $this->assertEquals($orderB->id, $result->items()[1]->id);
        $this->assertEquals($orderC->id, $result->items()[2]->id);
    }

    #[Test]
    public function it_sorts_by_customer_name_correctly()
    {
        // Create test data
        $customerA = User::factory()->create(['first_name' => 'Alice']);
        $customerB = User::factory()->create(['first_name' => 'Bob']);
        $customerC = User::factory()->create(['first_name' => 'Charlie']);
        
        $orderC = Order::factory()->create(['customer_id' => $customerC->id]);
        $orderA = Order::factory()->create(['customer_id' => $customerA->id]);
        $orderB = Order::factory()->create(['customer_id' => $customerB->id]);

        // Sort by customer name ascending
        $result = $this->repository->getPaginatedOrders([
            'sort_by' => 'customer',
            'sort_order' => 'asc'
        ]);

        $this->assertEquals($orderA->id, $result->items()[0]->id);
        $this->assertEquals($orderB->id, $result->items()[1]->id);
        $this->assertEquals($orderC->id, $result->items()[2]->id);
    }

    #[Test]
    public function it_sorts_by_schedule_start_time_correctly()
    {
        // Create test data
        $scheduleA = Schedule::factory()->create(['start_time' => '09:00:00']);
        $scheduleB = Schedule::factory()->create(['start_time' => '10:00:00']);
        $scheduleC = Schedule::factory()->create(['start_time' => '11:00:00']);
        
        $orderC = Order::factory()->create(['schedule_id' => $scheduleC->id]);
        $orderA = Order::factory()->create(['schedule_id' => $scheduleA->id]);
        $orderB = Order::factory()->create(['schedule_id' => $scheduleB->id]);

        // Sort by schedule start time ascending
        $result = $this->repository->getPaginatedOrders([
            'sort_by' => 'schedule',
            'sort_order' => 'asc'
        ]);

        $this->assertEquals($orderA->id, $result->items()[0]->id);
        $this->assertEquals($orderB->id, $result->items()[1]->id);
        $this->assertEquals($orderC->id, $result->items()[2]->id);
    }

    #[Test]
    public function it_sorts_by_order_status_name_correctly()
    {
        // Create test data
        $statusA = OrderStatus::factory()->create(['name' => 'Cancelled']);
        $statusB = OrderStatus::factory()->create(['name' => 'Completed']);
        $statusC = OrderStatus::factory()->create(['name' => 'Pending']);
        
        $orderC = Order::factory()->create(['order_status_id' => $statusC->id]);
        $orderA = Order::factory()->create(['order_status_id' => $statusA->id]);
        $orderB = Order::factory()->create(['order_status_id' => $statusB->id]);

        // Sort by order status name ascending
        $result = $this->repository->getPaginatedOrders([
            'sort_by' => 'order_status',
            'sort_order' => 'asc'
        ]);

        $this->assertEquals($orderA->id, $result->items()[0]->id);
        $this->assertEquals($orderB->id, $result->items()[1]->id);
        $this->assertEquals($orderC->id, $result->items()[2]->id);
    }

    #[Test]
    public function it_sorts_by_created_at_correctly()
    {
        // Create test data with specific timestamps
        $order1 = Order::factory()->create(['created_at' => '2024-01-01 10:00:00']);
        $order2 = Order::factory()->create(['created_at' => '2024-01-02 10:00:00']);
        $order3 = Order::factory()->create(['created_at' => '2024-01-03 10:00:00']);

        // Sort by created_at ascending
        $result = $this->repository->getPaginatedOrders([
            'sort_by' => 'created_at',
            'sort_order' => 'asc'
        ]);

        $this->assertEquals($order1->id, $result->items()[0]->id);
        $this->assertEquals($order2->id, $result->items()[1]->id);
        $this->assertEquals($order3->id, $result->items()[2]->id);
    }

    #[Test]
    public function it_handles_invalid_sort_field_gracefully()
    {
        // Create test data
        Order::factory()->count(3)->create();

        // Try to sort by invalid field
        $result = $this->repository->getPaginatedOrders([
            'sort_by' => 'invalid_field',
            'sort_order' => 'asc'
        ]);

        // Should fall back to default sorting (created_at desc)
        $this->assertCount(3, $result->items());
        $this->assertNotEmpty($result->items());
    }

    #[Test]
    public function it_returns_correct_allowed_sort_fields()
    {
        $allowedFields = $this->repository->getAllowedSortFields();

        $this->assertContains('created_at', $allowedFields);
        $this->assertContains('updated_at', $allowedFields);
        $this->assertContains('customer_id', $allowedFields);
        $this->assertContains('subject_id', $allowedFields);
        $this->assertContains('topic_id', $allowedFields);
        $this->assertContains('schedule_id', $allowedFields);
    }

    #[Test]
    public function it_returns_correct_default_sort_values()
    {
        $this->assertEquals('created_at', $this->repository->getDefaultSortBy());
        $this->assertEquals('desc', $this->repository->getDefaultSortOrder());
    }

    #[Test]
    public function it_includes_relationships_when_specified()
    {
        // Create test data
        Order::factory()->create();

        // Get with relationships
        $result = $this->repository->getPaginatedOrders([], [
            'subject',
            'customer',
            'schedule'
        ]);

        $this->assertCount(1, $result->items());
        $this->assertTrue($result->items()[0]->relationLoaded('subject'));
        $this->assertTrue($result->items()[0]->relationLoaded('customer'));
        $this->assertTrue($result->items()[0]->relationLoaded('schedule'));
    }
} 