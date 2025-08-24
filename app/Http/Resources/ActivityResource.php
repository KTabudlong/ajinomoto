<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityResource extends JsonResource
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
            'title' => $this->title,
            'description' => $this->description,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),
                                  'status' => $this->whenLoaded('status', function () {
                          return [
                              'id' => $this->status->id,
                              'name' => $this->status->name,
                              'slug' => $this->status->slug,
                              'color' => $this->status->color,
                              'color_classes' => $this->status->color_classes,
                          ];
                      }),
            'frequency_config' => $this->frequency_config,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            
            // Relationships
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),
            
            'activity_type' => $this->whenLoaded('activityType', function () {
                return [
                    'id' => $this->activityType->id,
                    'name' => $this->activityType->name,
                    'slug' => $this->activityType->slug,
                    'description' => $this->activityType->description,
                ];
            }),
            
            'site' => $this->whenLoaded('site', function () {
                return [
                    'id' => $this->site->id,
                    'name' => $this->site->name,
                    'city' => $this->site->city,
                    'state' => $this->site->state,
                    'full_address' => $this->site->full_address,
                ];
            }),
            
            'topic' => $this->whenLoaded('topic', function () {
                return [
                    'id' => $this->topic->id,
                    'name' => $this->topic->name,
                    'description' => $this->topic->description,
                ];
            }),
            
            // Computed fields
            'is_recurring' => $this->activity_type_id !== 1, // Assuming ID 1 is 'single'
            'duration_days' => $this->start_date && $this->end_date 
                ? $this->start_date->diffInDays($this->end_date) + 1 
                : 1,
            
            // Permissions (if user is authenticated)
            'can_edit' => $request->user() 
                ? ($this->user_id === $request->user()->id || $request->user()->isAdmin())
                : false,
            'can_delete' => $request->user() 
                ? ($this->user_id === $request->user()->id || $request->user()->isAdmin())
                : false,
        ];
    }
}
