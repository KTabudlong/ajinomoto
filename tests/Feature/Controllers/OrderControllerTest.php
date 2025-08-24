<?php
namespace Tests\Feature\Controllers;

use App\Models\Order;
use App\Models\OrderStatus;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $customer;

    protected function setUp(): void
    {
        parent::setUp();

                                                                     // Create test users
        $this->admin    = User::factory()->create(['role_id' => 1]); // Admin
        $this->customer = User::factory()->create(['role_id' => 2]); // Customer

        Mail::fake();
    }

    #[Test]
    public function admin_can_view_all_orders()
    {
        // Create test orders
        Order::factory()->create();
        Order::factory()->create();

        $response = $this->actingAs($this->admin)
            ->get(route('orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) =>
            $page->component('Bookings/Index')
                ->has('bookings.data', 2)
        );
    }

    #[Test]
    public function customer_can_only_view_their_own_orders()
    {
        // Create test orders
        $customerOrder = Order::factory()->create(['customer_id' => $this->customer->id]);
        $otherOrder    = Order::factory()->create(); // Different customer

        $response = $this->actingAs($this->customer)
            ->get(route('orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) =>
            $page->component('Bookings/Index')
                ->has('bookings.data', 1)
                ->where('bookings.data.0.id', $customerOrder->id)
        );
    }

    #[Test]
    public function orders_can_be_sorted_by_subject()
    {
        // Create test data
        $subjectA = Subject::factory()->create(['name' => 'Algebra']);
        $subjectB = Subject::factory()->create(['name' => 'Biology']);

        $orderB = Order::factory()->create(['subject_id' => $subjectB->id]);
        $orderA = Order::factory()->create(['subject_id' => $subjectA->id]);

        $response = $this->actingAs($this->admin)
            ->get(route('orders.index', ['sort_by' => 'subject', 'sort_order' => 'asc']));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) =>
            $page->component('Bookings/Index')
                ->has('bookings.data', 2)
                ->where('bookings.data.0.id', $orderA->id)
                ->where('bookings.data.1.id', $orderB->id)
        );
    }

    #[Test]
    public function orders_can_be_sorted_by_customer()
    {
        // Create test data
        $customerA = User::factory()->create(['first_name' => 'Alice']);
        $customerB = User::factory()->create(['first_name' => 'Bob']);

        $orderB = Order::factory()->create(['customer_id' => $customerB->id]);
        $orderA = Order::factory()->create(['customer_id' => $customerA->id]);

        $response = $this->actingAs($this->admin)
            ->get(route('orders.index', ['sort_by' => 'customer', 'sort_order' => 'asc']));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) =>
            $page->component('Bookings/Index')
                ->has('bookings.data', 2)
                ->where('bookings.data.0.id', $orderA->id)
                ->where('bookings.data.1.id', $orderB->id)
        );
    }

    #[Test]
    public function orders_can_be_sorted_by_schedule()
    {
        // Create test data
        $scheduleA = Schedule::factory()->create(['start_time' => '09:00:00']);
        $scheduleB = Schedule::factory()->create(['start_time' => '10:00:00']);

        $orderB = Order::factory()->create(['schedule_id' => $scheduleB->id]);
        $orderA = Order::factory()->create(['schedule_id' => $scheduleA->id]);

        $response = $this->actingAs($this->admin)
            ->get(route('orders.index', ['sort_by' => 'schedule', 'sort_order' => 'asc']));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) =>
            $page->component('Bookings/Index')
                ->has('bookings.data', 2)
                ->where('bookings.data.0.id', $orderA->id)
                ->where('bookings.data.1.id', $orderB->id)
        );
    }

    #[Test]
    public function orders_can_be_sorted_by_order_status()
    {
        // Create test data
        $statusA = OrderStatus::factory()->create(['name' => 'Cancelled']);
        $statusB = OrderStatus::factory()->create(['name' => 'Completed']);

        $orderB = Order::factory()->create(['order_status_id' => $statusB->id]);
        $orderA = Order::factory()->create(['order_status_id' => $statusA->id]);

        $response = $this->actingAs($this->admin)
            ->get(route('orders.index', ['sort_by' => 'order_status', 'sort_order' => 'asc']));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) =>
            $page->component('Bookings/Index')
                ->has('bookings.data', 2)
                ->where('bookings.data.0.id', $orderA->id)
                ->where('bookings.data.1.id', $orderB->id)
        );
    }

    #[Test]
    public function orders_can_be_sorted_by_created_at()
    {
        // Create test data with specific timestamps
        $order1 = Order::factory()->create(['created_at' => '2024-01-01 10:00:00']);
        $order2 = Order::factory()->create(['created_at' => '2024-01-02 10:00:00']);

        $response = $this->actingAs($this->admin)
            ->get(route('orders.index', ['sort_by' => 'created_at', 'sort_order' => 'asc']));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) =>
            $page->component('Bookings/Index')
                ->has('bookings.data', 2)
                ->where('bookings.data.0.id', $order1->id)
                ->where('bookings.data.1.id', $order2->id)
        );
    }

    #[Test]
    public function orders_can_be_searched()
    {
        // Create test data
        $subject          = Subject::factory()->create(['name' => 'Mathematics']);
        $matchingOrder    = Order::factory()->create(['subject_id' => $subject->id]);
        $nonMatchingOrder = Order::factory()->create();

        $response = $this->actingAs($this->admin)
            ->get(route('orders.index', ['search' => 'Mathematics']));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) =>
            $page->component('Bookings/Index')
                ->has('bookings.data', 1)
                ->where('bookings.data.0.id', $matchingOrder->id)
        );
    }

    #[Test]
    public function admin_can_view_order_details()
    {
        $order = Order::factory()->create();

        $response = $this->actingAs($this->admin)
            ->get(route('orders.show', $order));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) =>
            $page->component('Bookings/Show')
                ->has('booking')
                ->where('booking.id', $order->id)
        );
    }

    #[Test]
    public function customer_can_view_their_own_order_details()
    {
        $order = Order::factory()->create([
            'customer_id' => $this->customer->id,
        ]);

        $response = $this->actingAs($this->customer)
            ->get(route('orders.show', $order));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) =>
            $page->component('Bookings/Show')
                ->has('booking')
                ->where('booking.id', $order->id)
        );
    }

    #[Test]
    public function customer_cannot_view_other_orders()
    {
        $order = Order::factory()->create(); // Different customer

        $response = $this->actingAs($this->customer)
            ->get(route('orders.show', $order));

        $response->assertStatus(403);
    }

    #[Test]
    public function admin_can_view_order_creation_form()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('orders.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) =>
            $page->component('Bookings/Create')
                ->has('subjects')
                ->has('schedules')
                ->has('orderStatuses')
        );
    }

    #[Test]
    public function admin_can_create_order()
    {
        $subject      = Subject::factory()->create();
        $schedule     = Schedule::factory()->create();
        $orderStatus  = OrderStatus::factory()->create();
        $deliveryType = \App\Models\DeliveryType::factory()->create();

        $orderData = [
            'subject_id'       => $subject->id,
            'schedule_id'      => $schedule->id,
            'order_status_id'  => $orderStatus->id,
            'delivery_type_id' => $deliveryType->id,
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('orders.store'), $orderData);

        $response->assertRedirect(route('bookings'));
        $this->assertDatabaseHas('orders', [
            'subject_id' => $subject->id,
        ]);
    }

    #[Test]
    public function admin_can_view_order_edit_form()
    {
        $order = Order::factory()->create();

        $response = $this->actingAs($this->admin)
            ->get(route('orders.edit', $order));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) =>
            $page->component('Bookings/Edit')
                ->has('booking')
                ->has('subjects')
                ->has('schedules')
                ->has('orderStatuses')
        );
    }

    #[Test]
    public function admin_can_update_order()
    {
        $order        = Order::factory()->create();
        $subject      = Subject::factory()->create();
        $schedule     = Schedule::factory()->create();
        $orderStatus  = OrderStatus::factory()->create();
        $deliveryType = \App\Models\DeliveryType::factory()->create();

        $updateData = [
            'subject_id'       => $subject->id,
            'schedule_id'      => $schedule->id,
            'order_status_id'  => $orderStatus->id,
            'delivery_type_id' => $deliveryType->id,
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('orders.update', $order), $updateData);

        $response->assertRedirect(route('bookings.edit', $order));
        $this->assertDatabaseHas('orders', [
            'id'         => $order->id,
            'subject_id' => $subject->id,
        ]);
    }

    #[Test]
    public function admin_can_delete_order()
    {
        $order = Order::factory()->create();

        $response = $this->actingAs($this->admin)
            ->delete(route('orders.destroy', $order));

        $response->assertRedirect();
        $this->assertSoftDeleted('orders', ['id' => $order->id]);
    }

    #[Test]
    public function admin_can_restore_deleted_order()
    {
        $order = Order::factory()->create();
        $order->delete();

        $response = $this->actingAs($this->admin)
            ->put(route('orders.restore', $order));

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', ['id' => $order->id]);
    }

    #[Test]
    public function admin_can_force_delete_order()
    {
        $order = Order::factory()->create();
        $order->delete();

        $response = $this->actingAs($this->admin)
            ->delete(route('orders.force-delete', $order));

        $response->assertRedirect(route('orders.index'));
        $this->assertDatabaseMissing('orders', ['id' => $order->id]);
    }

    #[Test]
    public function admin_can_cancel_order()
    {
        $order = Order::factory()->create();

        $response = $this->actingAs($this->admin)
            ->put(route('orders.cancel', $order));

        $response->assertRedirect();
    }

    #[Test]
    public function admin_can_test_cancellation_email()
    {
        $order = Order::factory()->create();

        $response = $this->actingAs($this->admin)
            ->post(route('orders.test-cancellation-email', $order));

        $response->assertRedirect();
    }

    #[Test]
    public function admin_can_create_booking()
    {
        $order = Order::factory()->create();

        $response = $this->actingAs($this->admin)
            ->post(route('orders.create-booking', $order));

        $response->assertRedirect(route('bookings.select-subject'));
    }

    #[Test]
    public function validation_works_for_order_creation()
    {
        $response = $this->actingAs($this->admin)
            ->post(route('orders.store'), []);

        $response->assertSessionHasErrors(['subject_id', 'schedule_id', 'delivery_type_id', 'order_status_id']);
    }

    #[Test]
    public function validation_works_for_order_update()
    {
        $order = Order::factory()->create();

        $response = $this->actingAs($this->admin)
            ->put(route('orders.update', $order), []);

        $response->assertSessionHasErrors(['subject_id', 'schedule_id', 'delivery_type_id', 'order_status_id']);
    }

    #[Test]
    public function pagination_works_correctly()
    {
        // Create more than 15 orders (default pagination)
        Order::factory()->count(20)->create();

        $response = $this->actingAs($this->admin)
            ->get(route('orders.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) =>
            $page->component('Bookings/Index')
                ->has('bookings.data')
                ->has('bookings.links')
        );
    }

    #[Test]
    public function trashed_filter_works_correctly()
    {
        // Create normal and soft-deleted orders
        $normalOrder  = Order::factory()->create();
        $deletedOrder = Order::factory()->create();
        $deletedOrder->delete();

        $response = $this->actingAs($this->admin)
            ->get(route('orders.index', ['trashed' => 'with']));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) =>
            $page->component('Bookings/Index')
                ->has('bookings.data', 2)
        );
    }
}
