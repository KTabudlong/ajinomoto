<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Resources\Json\ResourceCollection;

class ScheduleCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return $this->collection->map(fn($schedule) => [
            'id'         => $schedule->id,
            'user_id'         => $schedule->user_id,
            'user'    => new UserResource(User::find($schedule->user_id)),
            'start_time'       => $schedule->start_time,
            'end_time'      => $schedule->end_time,
            'created_at' => $schedule->created_at,
            'updated_at' => $schedule->updated_at,
            'deleted_at' => $schedule->deleted_at,
        ]);
    }
}
