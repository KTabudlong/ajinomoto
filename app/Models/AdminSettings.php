<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Database\Factories\AdminSettingsFactory;

class AdminSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'description',
    ];

    protected $casts = [
        'value' => 'string', // We'll handle JSON casting manually for flexibility
    ];

    // Note: Static methods have been moved to AdminSettingsService
    // Use the service layer for getting/setting values

    /**
     * Create a new factory instance for the model.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    protected static function newFactory()
    {
        return AdminSettingsFactory::new();
    }
}
