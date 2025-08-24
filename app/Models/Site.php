<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Site extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'address',
        'city',
        'state',
        'zip_code',
        'phone',
        'email',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the activities for this site.
     */
    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    /**
     * Scope to get only active sites.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    /**
     * Get the full address as a formatted string.
     */
    public function getFullAddressAttribute()
    {
        $parts = array_filter([$this->address, $this->city, $this->state, $this->zip_code]);
        return implode(', ', $parts);
    }
}
