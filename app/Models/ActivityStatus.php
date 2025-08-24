<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ActivityStatus extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get activities with this status
     */
    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    /**
     * Scope for active statuses
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for ordered statuses
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Get CSS classes for the status color
     */
    public function getColorClassesAttribute(): string
    {
        $colorMap = [
            'active' => 'bg-green-100 text-green-800 border-green-200',
            'paused' => 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'completed' => 'bg-blue-100 text-blue-800 border-blue-200',
            'cancelled' => 'bg-red-100 text-red-800 border-red-200',
        ];

        return $colorMap[$this->slug] ?? 'bg-gray-100 text-gray-800 border-gray-200';
    }
}
