<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'schedule_id' => $this->schedule_id,
            'customer_id' => $this->customer_id,
            'subject_id' => $this->subject_id,
            'topic_id' => $this->topic_id,
            'delivery_type_id' => $this->delivery_type_id,
            'order_status_id' => $this->order_status_id,
            'teacher_comment' => $this->teacher_comment,
            'customer_comment' => $this->customer_comment,
            'rating' => $this->rating,
            'refund_amount' => $this->refund_amount,
            'refunded_at' => $this->refunded_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'deleted_at' => $this->deleted_at,
            
            // Relationships
            'schedule' => $this->whenLoaded('schedule'),
            'customer' => $this->whenLoaded('customer', function () {
                return [
                    'id' => $this->customer->id,
                    'name' => $this->customer->name,
                    'email' => $this->customer->email,
                ];
            }),
            'subject' => $this->whenLoaded('subject'),
            'topic' => $this->whenLoaded('topic'),
            'delivery_type' => $this->whenLoaded('deliveryType'),
            'order_status' => $this->whenLoaded('orderStatus'),
            'payment' => $this->whenLoaded('payment'),
        ];
    }
} 