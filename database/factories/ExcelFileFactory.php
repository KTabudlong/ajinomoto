<?php

namespace Database\Factories;

use App\Models\ExcelFile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExcelFile>
 */
class ExcelFileFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ExcelFile::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['pending', 'processing', 'completed', 'failed'];
        $fileTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        
        return [
            'filename' => 'excel_' . $this->faker->uuid . '.xlsx',
            'original_filename' => $this->faker->randomElement([
                'Master Sequential Compliance Tasks.xlsx',
                'Toluca Environmental Compliance Calendar.xlsx',
                'Compliance Report 2025.xlsx',
                'Environmental Tasks.xlsx'
            ]),
            'file_path' => 'excel_files/' . $this->faker->uuid . '.xlsx',
            'file_size' => $this->faker->numberBetween(1024, 10485760), // 1KB to 10MB
            'file_type' => $this->faker->randomElement($fileTypes),
            'status' => $this->faker->randomElement($statuses),
            'processed_at' => $this->faker->optional(0.7)->dateTimeBetween('-1 month', 'now'),
            'total_tasks' => $this->faker->numberBetween(0, 100),
            'total_events' => $this->faker->numberBetween(0, 500),
            'user_id' => User::factory(),
        ];
    }

    /**
     * Indicate that the file is pending processing.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'processed_at' => null,
            'total_tasks' => 0,
            'total_events' => 0,
        ]);
    }

    /**
     * Indicate that the file is currently being processed.
     */
    public function processing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'processing',
            'processed_at' => null,
            'total_tasks' => 0,
            'total_events' => 0,
        ]);
    }

    /**
     * Indicate that the file has been successfully processed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'processed_at' => now(),
            'total_tasks' => $this->faker->numberBetween(10, 100),
            'total_events' => $this->faker->numberBetween(50, 500),
        ]);
    }

    /**
     * Indicate that the file processing failed.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'processed_at' => null,
            'total_tasks' => 0,
            'total_events' => 0,
        ]);
    }
}
