<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Activity extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'activity_type_id',
        'site_id',
        'topic_id',
        'title',
        'description',
        'start_date',
        'end_date',
        'frequency_config',
        'status',
        'metadata',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'frequency_config' => 'array',
        'metadata' => 'array',
    ];

    /**
     * Get the user that owns the activity.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the activity type.
     */
    public function activityType()
    {
        return $this->belongsTo(ActivityType::class);
    }

    /**
     * Get the site where the activity takes place.
     */
    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    /**
     * Get the topic of the activity.
     */
    public function topic()
    {
        return $this->belongsTo(Topic::class);
    }

    /**
     * Scope to get only active activities.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to get activities by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get activities within a date range.
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_date', [$startDate, $endDate])
              ->orWhereBetween('end_date', [$startDate, $endDate])
              ->orWhere(function ($subQ) use ($startDate, $endDate) {
                  $subQ->where('start_date', '<=', $startDate)
                        ->where('end_date', '>=', $endDate);
              });
        });
    }
}
