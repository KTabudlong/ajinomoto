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
        Schema::create('time_formats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('format', ['12h', '24h'])->default('12h'); // 12-hour or 24-hour format
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // One format per user
            $table->unique('user_id');
            $table->index(['user_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('time_formats');
    }
};
