<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class GroupCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return $this->collection->map(fn($group) => [
            'id'            => $group->id,
            'name'          => $group->name,
            'created_at'    => $group->created_at,
            'members_count' => $group->users()->count(),
            // 'users'      => $group->users, // Uncomment if you want to include user details
        ]);
    }
}
