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
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('activity_type_id')->constrained()->onDelete('cascade');
            $table->foreignId('site_id')->constrained()->onDelete('cascade');
            $table->foreignId('topic_id')->constrained()->onDelete('cascade');
            
            // Activity details
            $table->string('title', 255);
            $table->longText('description');
            
            // Frequency configuration
            $table->date('start_date');
            $table->date('end_date')->nullable(); // Null for ongoing activities
            
            // Type-specific configuration stored as JSON
            $table->json('frequency_config')->nullable();
            
            // Status
            $table->foreignId('activity_status_id')->constrained()->onDelete('cascade');
            
            // Metadata
            $table->json('metadata')->nullable(); // For storing additional type-specific data
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
