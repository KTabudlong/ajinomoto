<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'role_id'    => $this->role_id,
            'tutor_id'   => $this->tutor_id,
            'first_name' => $this->first_name,
            'last_name'  => $this->last_name,
            'name'       => $this->name,
            'email'      => $this->email,
            'contact'    => $this->contact,
            'avatar'     => $this->avatar ? url()->route('image', ['path' => $this->photo, 'w' => 60, 'h' => 60, 'fit' => 'crop']) : null,
            'created_at' => $this->created_at,
            'deleted_at' => $this->deleted_at,
        ];
    }
}
