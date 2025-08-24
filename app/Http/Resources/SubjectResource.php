<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubjectResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'is_active' => $this->is_active ?? true,
            'is_showcase' => $this->is_showcase ?? false,
            'sort_order' => $this->sort_order ?? 0,
            'topics_count' => $this->whenCounted('topics'),
            'topics' => $this->whenLoaded('topics'),
            'tutor' => $this->whenLoaded('tutor', function () {
                return new UserResource($this->tutor);
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}
