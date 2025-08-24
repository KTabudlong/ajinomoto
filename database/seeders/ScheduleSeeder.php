<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\Schedule;

class ScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tutorEmails = ['tutor@one.com', 'tutor@two.com'];
        foreach ($tutorEmails as $email) {
            $tutor = User::where('email', $email)->first();
            if (!$tutor) continue;

            // Get a subject and topic for this tutor (create if needed)
            $subject = Subject::where('tutor_id', $tutor->id)->first();
            if (!$subject) {
                $subject = Subject::factory()->create(['tutor_id' => $tutor->id]);
            }
            $topic = $subject->topics()->first();
            if (!$topic) {
                $topic = Topic::factory()->create(['subject_id' => $subject->id]);
            }

            // Create up to 2 schedules for this tutor
            for ($i = 0; $i < 2; $i++) {
                $startTime = Carbon::now()->addDays($i)->setTime(9, 0, 0);
                $endTime = $startTime->copy()->addHour();
                Schedule::factory()->create([
                    'user_id' => $tutor->id,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'created_at' => Carbon::now()->subDays(rand(1, 30))->subHours(rand(1, 23)),
                    'updated_at' => Carbon::now()->subDays(rand(1, 30))->subHours(rand(1, 23)),
                ]);
            }
        }
    }
}
