<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExcelFile extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'filename',
        'original_filename',
        'file_path',
        'file_size',
        'file_type',
        'status',
        'processed_at',
        'total_tasks',
        'total_events',
        'user_id'
    ];

    protected $casts = [
        'processed_at' => 'datetime',
        'file_size' => 'integer',
        'total_tasks' => 'integer',
        'total_events' => 'integer'
    ];

    protected $dates = [
        'processed_at',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    /**
     * Get the user who uploaded the file
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the status badge variant
     */
    public function getStatusBadgeVariantAttribute()
    {
        return match($this->status) {
            'pending' => 'warning',
            'processing' => 'info',
            'completed' => 'success',
            'failed' => 'error',
            default => 'default'
        };
    }

    /**
     * Get the file size in human readable format
     */
    public function getFileSizeHumanAttribute()
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
