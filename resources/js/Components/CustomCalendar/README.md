# CustomCalendar Component

A unified, reusable calendar component based on `react-calendar` that provides consistent styling and functionality across the application.

## Features

- **Multiple Modes**: Create, Edit, and View modes with different behaviors
- **Schedule Types**: Support for Single, Weekly, and Monthly schedule types
- **Visual Feedback**: Color-coded dates for different states (selected, added, removed, unchanged)
- **Schedule Integration**: Shows existing schedules with red dots and tooltips
- **Accessibility**: ARIA labels and keyboard navigation support
- **Responsive**: Mobile-friendly design
- **Customizable**: Extensive props for styling and behavior

## Props

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedDates` | `Date[]` | `[]` | Currently selected dates |
| `onDateSelect` | `function` | `null` | Callback when dates are selected |
| `schedules` | `Array` | `[]` | Array of existing schedules |
| `settings` | `Object` | `{}` | Calendar settings (dayColors, timeFormat) |

### Display Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showTooltips` | `boolean` | `true` | Show tooltips on hover |
| `showScheduleDots` | `boolean` | `true` | Show red dots for scheduled dates |
| `showDayColors` | `boolean` | `true` | Show day colors in headers |

### Mode & Type

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `string` | `"create"` | "create", "edit", or "view" |
| `scheduleType` | `string` | `"single"` | "single", "weekly", or "monthly" |
| `originalDates` | `Date[]` | `[]` | Original dates for edit mode |

### Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `"w-full"` | CSS classes for the calendar |
| `minDate` | `Date` | `new Date()` | Minimum selectable date |
| `maxDate` | `Date` | `null` | Maximum selectable date |

### Callbacks

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onMonthChange` | `function` | `null` | Called when month changes |
| `onDateHover` | `function` | `null` | Called when hovering over dates |

## Usage Examples

### Basic Create Mode

```jsx
import CustomCalendar from "@/Components/CustomCalendar";

const MyComponent = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  
  return (
    <CustomCalendar
      selectedDates={selectedDates}
      onDateSelect={setSelectedDates}
      schedules={existingSchedules}
      settings={{ dayColors, timeFormat: "12h" }}
      scheduleType="single"
      mode="create"
    />
  );
};
```

### Edit Mode with Changes

```jsx
<CustomCalendar
  selectedDates={currentDates}
  originalDates={originalDates}
  schedules={existingSchedules}
  settings={settings}
  scheduleType="single"
  mode="edit"
  onDateSelect={handleDateChange}
/>
```

### Weekly Schedule Mode

```jsx
<CustomCalendar
  selectedDates={selectedDates}
  onDateSelect={handleWeeklySelection}
  schedules={existingSchedules}
  settings={settings}
  scheduleType="weekly"
  mode="create"
  weekDates={weekDates}
  displayedMonth={currentMonth}
  displayedYear={currentYear}
/>
```

### Read-only View Mode

```jsx
<CustomCalendar
  selectedDates={scheduleDates}
  schedules={existingSchedules}
  settings={settings}
  scheduleType="single"
  mode="view"
  showTooltips={false}
  showScheduleDots={false}
/>
```

## Color States

The calendar uses different colors to indicate date states:

- **Selected**: Indigo background (default selection)
- **Added**: Green background (new dates in edit mode)
- **Removed**: Red background (removed dates in edit mode)
- **Unchanged**: Gray background (unchanged dates in edit mode)
- **Disabled**: Grayed out (past dates or conflicts)

## Settings Object

```javascript
const settings = {
  dayColors: {
    0: "#EF4444", // Sunday - Red
    1: "#F59E0B", // Monday - Amber
    2: "#10B981", // Tuesday - Green
    3: "#3B82F6", // Wednesday - Blue
    4: "#8B5CF6", // Thursday - Purple
    5: "#F97316", // Friday - Orange
    6: "#EC4899"  // Saturday - Pink
  },
  timeFormat: "12h" // or "24h"
};
```

## Schedule Data Format

```javascript
const schedules = [
  {
    start_time: "2025-08-10 09:00:00",
    end_time: "2025-08-10 12:00:00"
  }
];
```

## Accessibility

The component includes:
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Semantic HTML structure

## Responsive Design

The calendar is responsive and works well on:
- Desktop (full calendar view)
- Tablet (medium-sized calendar)
- Mobile (compact calendar with touch-friendly interactions)
