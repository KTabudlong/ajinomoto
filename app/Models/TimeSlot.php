<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'start_time',
        'end_time',
        'is_active',
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the time slot.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get active time slots.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get super admin default time slots (user_id = 1).
     */
    public function scopeSuperAdminDefaults($query)
    {
        return $query->where('user_id', 1);
    }

    /**
     * Get time slots for a specific user or system defaults.
     */
    public static function getForUser(?int $userId = null)
    {
        if ($userId) {
            $userSlots = static::where('user_id', $userId)->active()->get();
            if ($userSlots->isNotEmpty()) {
                return $userSlots;
            }
        }
        
        // Fall back to system defaults (null user_id)
        return static::whereNull('user_id')->active()->get();
    }

    /**
     * Get formatted time range.
     */
    public function getFormattedTimeRangeAttribute(): string
    {
        return $this->start_time->format('H:i') . ' - ' . $this->end_time->format('H:i');
    }
} 