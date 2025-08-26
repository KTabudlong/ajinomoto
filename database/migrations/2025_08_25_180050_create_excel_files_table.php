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
        Schema::create('excel_files', function (Blueprint $table) {
            $table->id();
            $table->string('filename'); // Stored filename
            $table->string('original_filename'); // Original uploaded filename
            $table->string('file_path'); // Path to stored file
            $table->bigInteger('file_size'); // File size in bytes
            $table->string('file_type'); // File MIME type
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->timestamp('processed_at')->nullable(); // When processing completed
            $table->integer('total_tasks')->default(0); // Number of compliance tasks found
            $table->integer('total_events')->default(0); // Number of calendar events generated
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Who uploaded the file
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for better performance
            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('excel_files');
    }
};
