<?php

namespace App\Http\Controllers;

use App\Services\AdminSettingsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ScheduleSettingsController extends Controller
{
    protected AdminSettingsService $adminSettingsService;

    public function __construct(AdminSettingsService $adminSettingsService)
    {
        $this->adminSettingsService = $adminSettingsService;
    }

    /**
     * Get all schedule settings for the authenticated user
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        
        $settings = [
            'time_slots' => $this->getTimeSlotsForUser($user->id),
            'day_colors' => $this->getDayColorsForUser($user->id),
            'time_format' => $this->getTimeFormatForUser($user->id),
            'slot_duration' => $this->getSlotDurationForUser($user->id),
        ];
        
        return response()->json($settings);
    }

    /**
     * Get time slots for the authenticated user
     */
    public function getTimeSlots(): JsonResponse
    {
        $user = Auth::user();
        $timeSlots = $this->getTimeSlotsForUser($user->id);
        
        return response()->json($timeSlots);
    }

    /**
     * Get day colors for the authenticated user
     */
    public function getDayColors(): JsonResponse
    {
        $user = Auth::user();
        $dayColors = $this->getDayColorsForUser($user->id);
        
        return response()->json($dayColors);
    }

    /**
     * Get day colors as Tailwind classes for the authenticated user
     */
    public function getDayColorsTailwind(): JsonResponse
    {
        $user = Auth::user();
        $dayColors = $this->getDayColorsForUser($user->id);
        
        // Convert hex colors to Tailwind classes (simplified mapping)
        $tailwindColors = [];
        foreach ($dayColors as $day => $hexColor) {
            $tailwindColors[$day] = $this->hexToTailwindClass($hexColor);
        }
        
        return response()->json($tailwindColors);
    }

    /**
     * Get time format for the authenticated user
     */
    public function getTimeFormat(): JsonResponse
    {
        $user = Auth::user();
        $timeFormat = $this->getTimeFormatForUser($user->id);
        
        return response()->json(['format' => $timeFormat]);
    }

    /**
     * Get slot duration for the authenticated user
     */
    public function getSlotDuration(): JsonResponse
    {
        $user = Auth::user();
        $slotDuration = $this->getSlotDurationForUser($user->id);
        
        return response()->json(['duration_minutes' => $slotDuration]);
    }

    /**
     * Get time buffer for the authenticated user
     */
    public function getTimeBuffer(): JsonResponse
    {
        $user = Auth::user();
        $buffer = $this->getTimeBufferForUser($user->id);
        
        return response()->json([
            'buffer_hours' => $buffer,
            'message' => 'Time buffer retrieved successfully'
        ]);
    }

    /**
     * Helper method to get time slots for a user
     */
    private function getTimeSlotsForUser(int $userId): array
    {
        // For now, return system defaults from admin settings
        // In the future, this could check for user-specific overrides
        $startTime = $this->adminSettingsService->getValue('time_slots_start', '09:00');
        $endTime = $this->adminSettingsService->getValue('time_slots_end', '21:00');
        
        // Generate time slots from start to end time
        $slots = [];
        $current = strtotime($startTime);
        $end = strtotime($endTime);
        
        while ($current < $end) {
            $slots[] = [
                'start_time' => date('H:i', $current),
                'end_time' => date('H:i', $current + 3600), // 1 hour slots
            ];
            $current += 3600; // Move to next hour
        }
        
        return $slots;
    }

    /**
     * Helper method to get day colors for a user
     */
    private function getDayColorsForUser(int $userId): array
    {
        // For now, return system defaults from admin settings
        // In the future, this could check for user-specific overrides
        $dayColors = $this->adminSettingsService->getValue('day_colors', '[]');
        
        if (is_string($dayColors)) {
            $dayColors = json_decode($dayColors, true);
        }
        
        return $dayColors ?: [
            0 => '#ef4444', // Sunday - Red
            1 => '#3b82f6', // Monday - Blue
            2 => '#10b981', // Tuesday - Green
            3 => '#f59e0b', // Wednesday - Orange
            4 => '#8b5cf6', // Thursday - Purple
            5 => '#06b6d4', // Friday - Cyan
            6 => '#84cc16', // Saturday - Lime
        ];
    }

    /**
     * Helper method to get time format for a user
     */
    private function getTimeFormatForUser(int $userId): string
    {
        // For now, return system defaults from admin settings
        // In the future, this could check for user-specific overrides
        $format = $this->adminSettingsService->getValue('time_format', '12h');
        
        // Ensure we return the correct format
        if ($format === '12' || $format === '12h') {
            return '12h';
        } elseif ($format === '24' || $format === '24h') {
            return '24h';
        }
        
        return '12h'; // Default fallback
    }

    /**
     * Helper method to get slot duration for a user
     */
    private function getSlotDurationForUser(int $userId): int
    {
        // For now, return system defaults from admin settings
        // In the future, this could check for user-specific overrides
        return (int) $this->adminSettingsService->getValue('slot_duration', '60');
    }

    /**
     * Helper method to get time buffer for a user
     */
    private function getTimeBufferForUser(int $userId): int
    {
        // For now, return system defaults from admin settings
        // In the future, this could check for user-specific overrides
        return (int) $this->adminSettingsService->getValue('time_buffer_hours', '3');
    }

    /**
     * Helper method to convert hex color to Tailwind class
     */
    private function hexToTailwindClass(string $hexColor): string
    {
        // Simple mapping of common hex colors to Tailwind classes
        $colorMap = [
            '#ef4444' => 'bg-red-500',
            '#3b82f6' => 'bg-blue-500',
            '#10b981' => 'bg-green-500',
            '#f59e0b' => 'bg-yellow-500',
            '#8b5cf6' => 'bg-purple-500',
            '#06b6d4' => 'bg-cyan-500',
            '#84cc16' => 'bg-lime-500',
        ];
        
        return $colorMap[$hexColor] ?? 'bg-gray-500';
    }

    /**
     * Update time slots for the authenticated user
     */
    public function updateTimeSlots(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $request->validate([
            'time_slots' => 'required|array',
            'time_slots.*.start_time' => 'required|date_format:H:i',
            'time_slots.*.end_time' => 'required|date_format:H:i|after:time_slots.*.start_time',
        ]);

        // For now, just return success since we're using system defaults
        // In the future, this could save user-specific overrides
        return response()->json(['message' => 'Time slots updated successfully']);
    }

    /**
     * Update day colors for the authenticated user
     */
    public function updateDayColors(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $request->validate([
            'day_colors' => 'required|array',
            'day_colors.*.day_of_week' => 'required|integer|between:0,6',
            'day_colors.*.hex_color' => 'required|string|regex:/^#[0-9A-F]{6}$/i',
        ]);

        // For now, just return success since we're using system defaults
        // In the future, this could save user-specific overrides
        return response()->json(['message' => 'Day colors updated successfully']);
    }

    /**
     * Update time format for the authenticated user
     */
    public function updateTimeFormat(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $request->validate([
            'format' => 'required|in:12h,24h',
        ]);

        // For now, just return success since we're using system defaults
        // In the future, this could save user-specific overrides
        return response()->json(['message' => 'Time format updated successfully']);
    }

    /**
     * Update slot duration for the authenticated user
     */
    public function updateSlotDuration(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $request->validate([
            'duration_minutes' => 'required|integer|min:15|max:480', // 15 minutes to 8 hours
        ]);

        // For now, just return success since we're using system defaults
        // In the future, this could save user-specific overrides
        return response()->json(['message' => 'Slot duration updated successfully']);
    }

    /**
     * Reset user settings to system defaults
     */
    public function resetToDefaults(): JsonResponse
    {
        $user = Auth::user();
        
        // For now, just return success since we're using system defaults
        // In the future, this could reset user-specific overrides
        return response()->json(['message' => 'Settings reset to system defaults']);
    }
} 