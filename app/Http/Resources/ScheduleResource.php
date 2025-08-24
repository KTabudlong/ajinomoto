<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScheduleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'user_id'         => $this->user_id,
            'user'    => new UserResource(User::find($this->user_id)),
            'start_time' => $this->start_time,
            'end_time'  => $this->end_time,
            'deleted_at' => $this->deleted_at,
            // Add a 'date' field for frontend scheduling logic
            'date' => \Carbon\Carbon::parse($this->start_time)->toDateString(),
        ];
    }
}
