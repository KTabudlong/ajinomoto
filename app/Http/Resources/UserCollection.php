<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return $this->collection->map(fn($user) => [
            'id'         => $user->id,
            'role_id'    => $user->role_id,
            'tutor_id'   => $user->tutor_id,
            'name'       => $user->name,
            'email'      => $user->email,
            'contact'    => $user->contact,
            'avatar'     => $user->photo ? url()->route('image', ['path' => $user->avatar, 'w' => 60, 'h' => 60, 'fit' => 'crop']) : null,
            'created_at' => $user->created_at,
            'deleted_at' => $user->deleted_at,
        ]);
    }
}
