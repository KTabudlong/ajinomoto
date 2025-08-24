<?php

namespace App\Services;

use App\Models\Subject;
use App\Models\Topic;
use App\Models\Schedule;
use App\Models\DeliveryType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingFlowService
{
    public function __construct(
        private OrderService $orderService
    ) {}

    /**
     * Get active subjects with topics for booking flow
     */
    public function getActiveSubjectsWithTopics()
    {
        return Subject::where('is_active', true)->with('topics')->get();
    }

    /**
     * Get active topics for a subject
     */
    public function getActiveTopicsForSubject(Subject $subject)
    {
        return $subject->topics()->where('is_active', true)->get();
    }

    /**
     * Get available schedules for booking
     */
    public function getAvailableSchedules()
    {
        return Schedule::where('user_id', Auth::id())
            ->where('start_time', '>', now())
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Get delivery types for booking
     */
    public function getDeliveryTypes()
    {
        return DeliveryType::all();
    }

    /**
     * Create a booking from the flow
     */
    public function createBookingFromFlow(
        Request $request, 
        Subject $subject, 
        Topic $topic, 
        Schedule $schedule
    ) {
        $validated = $request->validate([
            'delivery_type_id' => 'required|exists:delivery_types,id',
            'customer_comment' => 'nullable|string',
        ]);

        $orderData = [
            'schedule_id' => $schedule->id,
            'customer_id' => Auth::id(),
            'subject_id' => $subject->id,
            'topic_id' => $topic->id,
            'delivery_type_id' => $validated['delivery_type_id'],
            'order_status_id' => 1, // Assuming 1 is "pending"
            'customer_comment' => $validated['customer_comment'] ?? '',
        ];

        return $this->orderService->createAsResource($orderData);
    }
} 