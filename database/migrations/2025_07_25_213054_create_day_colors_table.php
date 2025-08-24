<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('day_colors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('day_of_week'); // 0-6 (Sunday-Saturday)
            $table->string('hex_color', 7); // e.g., '#3B82F6', '#EF4444'
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Ensure one color per day per user
            $table->unique(['user_id', 'day_of_week']);
            $table->index(['user_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('day_colors');
    }
};
