
# Rapid Development Rules

- All future plans, ideas, or features discussed must be added to ROADMAP.md. Only tasks for the current session should be added to the active todo list.

To ensure rapid MVP delivery, follow these rules:

1. **Reuse Components:** Always check for existing components before creating new ones (especially tables, forms, buttons).
2. **SOLID + DRY Principles:** Keep code simple, single-responsibility, easy to extend, and avoid repetition. Create reusable components for recurring UI elements (day colors, legends, headers, etc.).
3. **Laravel-First, React-Adapts:** Backend drives the data structure; frontend adapts to it.
4. **Minimal Viable UI:** Focus on function over form for MVP. Polish later.
5. **Seed Realistic Data Early:** Use factories/seeders to generate data for testing and demo.
6. **Automate Repetitive Tasks:** Use code generators, artisan commands, and scripts where possible.
7. **Daily Standups/Check-ins:** Review progress and blockers every day.
8. **Document as You Go:** Update DEVELOPMENT_RULES.md and ROADMAP.md with new patterns and decisions.
9. **Test Critical Paths Only:** For MVP, focus tests on booking, registration, and payment flows.
10. **Defer Non-Essential Features:** Move anything not required for booking/payment to the backlog.
11. **Conduct a short retrospective at the end of every session or week.**
    - Use the following template and add entries to a RETROSPECTIVES.md file for tracking:
12. **Database Timezone Handling:** All date/time data in the database is stored in UTC. User is in CST (UTC-6). Avoid unnecessary timezone queries - assume UTC storage and handle timezone conversion in the frontend only when displaying to users.

---

## Retrospective Template

**Date:** [YYYY-MM-DD]

- **What went well?**
  - [List successes, smooth processes, wins]
- **What didn't go well?**
  - [List blockers, frustrations, or issues]
- **What will I do differently next time?**
  - [List improvements or changes for next session]

---

# Development Rules

- Always update the time log at the start and end of every working session, before any app discussion or code generation. The assistant should remind the user to do this if not already done.

## Code Generation Rules

### Table Component Pattern Consistency

**ALWAYS** reference existing successful table components before creating new ones. Use the exact pattern from working components to prevent empty tables.

**Reference Components:**

- `resources/js/Pages/Subjects/Index.jsx` - Primary reference
- `resources/js/Pages/Users/Index.jsx` - Secondary reference

**Required Pattern:**

```javascript
// 1. Data Access (ALWAYS use this exact pattern)
const data = subjects.data?.data || subjects.data || subjects;
const links = subjects.data?.links || subjects.links || [];
const tableData = Array.isArray(data) ? data : [];

// 2. SortableTable Props (ALWAYS use rows, never data)
<SortableTable
  columns={columns}
  rows={tableData}  // NOT data={tableData}
  onSort={handleSort}
    currentSortBy={filters?.sort_by || 'name'}
    currentSortOrder={filters?.sort_order || 'asc'}
/>

// 3. Column Structure (ALWAYS use name and renderCell)
const columns = [
  {
    name: 'name',           // NOT key
    label: 'Name',
    renderCell: (row) => (  // NOT render: (topic) =>
      <div>{row.name}</div> // NOT topic.name
    ),
  },
];

// 4. Pagination (ALWAYS direct, no conditional wrapper)
<Pagination links={links} />
```

**Why:** This prevents the recurring empty table issue that occurs when deviating from established patterns.

### Laravel-First Architecture

React frontend should adapt to Laravel backend data structure and conventions, not the other way around.

### Property Naming Conventions

- Use singular properties for single resource views (e.g., `user`, `subject`, `topic`)
- Use plural properties for collections (e.g., `users`, `subjects`, `topics`)
- Follow Laravel ResourceCollection structure for paginated data

### DRY Implementation Patterns

**When to Create Reusable Components:**
- **UI Elements:** Day headers, legends, schedule type indicators, color schemes
- **Logic Patterns:** Date formatting, schedule type detection, color utilities

### React Component Import/Export Standards

**CRITICAL: Always use consistent import/export patterns to prevent frustrating export errors.**

**Component Files (e.g., Button.jsx):**
```javascript
// ✅ CORRECT - Use default export
const Button = ({ ... }) => { ... };
export default Button;
```

**Index Files (e.g., Button/index.js):**
```javascript
// ✅ CORRECT - Re-export as named exports
export { default as Button } from './Button';
export { default as DeleteButton } from './DeleteButton';
```

**Usage in Components:**
```javascript
// ✅ CORRECT - Import from index (named export)
import { Button } from '@/Components/Button';
import { Card, CardContent } from '@/Components/Card';
import { TextInput, Label } from '@/Components/Form';
```

**❌ NEVER Mix Patterns:**
- Don't use direct imports: `import Button from '@/Components/Button/Button';`
- Don't use named exports in component files: `export { Button };`
- Don't mix default and named imports inconsistently

**Why:** This prevents the recurring "does not provide an export named..." errors that waste development time and cause frustration.

### React Component Standards

**Arrow Function Consistency:**
- **ALWAYS** use arrow function syntax for React components: `const ComponentName = () => {}`
- **NEVER** use function declarations: `function ComponentName() {}`
- **NEVER** use export default function: `export default function ComponentName() {}`
- **ALWAYS** use: `const ComponentName = () => {}` followed by `export default ComponentName;`

**Why:** Arrow functions provide cleaner, more consistent syntax and better alignment with modern React patterns.

**Example:**
```javascript
// ✅ CORRECT - Use this pattern
const UserProfile = ({ user, onUpdate }) => {
  return (
    <div>
      <h1>{user.name}</h1>
    </div>
  );
};

export default UserProfile;

// ❌ INCORRECT - Don't use these patterns
function UserProfile() {}
export default function UserProfile() {}
```
- **Layout Components:** Consistent headers, footers, navigation elements

**Component Creation Rules:**
- Extract when the same UI/logic appears in 2+ places
- Use props for customization (e.g., `showTodayIndicator`, `todayColor`)
- Centralize constants (colors, indicators) in utility files
- Follow consistent naming: `ComponentName` for components, `componentName` for instances

**Examples from Current Implementation:**
- `ScheduleLegend`: Reusable across calendar, weekly, and list views
- `DayHeader`: Consistent day styling with configurable options
- `colorUtils`: Centralized schedule type colors and indicators

### Authentication

- Use `Auth` facade instead of `auth()` helper for consistency
- Example: `Auth::id()` instead of `auth()->id()`

### Code Complexity

- Keep code simple with low cyclomatic and cognitive complexity
- Avoid adding explicit complexity like explicit route model binding where possible
- Clean up debugging code and loggers after use

### CSS and Third-Party Components

- When styling third-party components (like React Calendar), be aware of CSS specificity issues

### React useEffect Best Practices

**Validation and Navigation Logic:**

- **NEVER use useEffect for navigation validation** (e.g., checking array lengths to redirect users)
- **ONLY use useEffect for real-time user feedback** (e.g., password strength validation, form field validation)
- **Move validation logic to user interaction time** (e.g., `canNavigateToStep`, `canProceedToNext`, `handleConfirm`)

**Examples:**

```javascript
// ❌ WRONG - useEffect for navigation validation
useEffect(() => {
  if (selectedDates.length === 0) {
    setCurrentStep(1); // Redirects on every state change
  }
}, [selectedDates.length]);

// ✅ CORRECT - Validation at user interaction time
const goToStep = (step) => {
  if (step === 3 && selectedDates.length === 0) {
    setCurrentStep(1); // Only redirects when user tries to navigate
    return;
  }
  // ... proceed with navigation
};
```

**Why:** This prevents unnecessary re-renders, improves performance, and provides better user experience by only validating when needed.

- Third-party components may have default styles that override custom Tailwind classes
- Use custom CSS classes with `!important` or inline styles to ensure proper override
- Consider dynamic style injection for components that need custom styling overrides
- Example: React Calendar's default styles override Tailwind classes, requiring custom CSS with `!important`

### Database Operations

- Use database migrations for schema changes
- Apply migrations in production but use live data during development
- User will run migrations themselves; assistant should only edit migration files

### Testing

- Create simple debugging scripts instead of running commands directly in shell
- Use test@last.com as email for user ID 1 with password test123
- Use test1@last.com for user 2 in test data seeders
- Include safe handling for rows property (default to empty array) to prevent errors
- **Seed data with different creation dates** to enable proper sorting testing
  - Use `Carbon::now()->subDays($i)` or `Carbon::now()->subHours($i)` for varied timestamps
  - Example: `'created_at' => Carbon::now()->subDays(rand(1, 30))`
  - This allows testing of date-based sorting (created_at, updated_at) functionality

### UI/UX Patterns

- Back buttons should be labeled "back" and placed to the left of action buttons
- Every form card should include a header with a title
- Disable row click navigation and remove right arrow indicators from tables
- Use explicit action buttons with icons for table row actions
- Follow established patterns from successful components

### Deployment Considerations

- Design for Laravel Forge deployment
- Include monitoring and observability rules especially in production
- Design codebase to support potential future public API

### Documentation

- Keep documentation minimal with just a few good descriptions
- Follow SOLID principles
- Use dependency injection where appropriate
- Always import model classes (e.g., use App\Models\Role;) in policies, middleware, and controllers. Never use fully qualified class names inline for constants or static methods. This keeps code clean and maintainable.
- This project uses Laravel 11. Always follow Laravel 11 conventions, documentation, and project structure (e.g., middleware registration in bootstrap/app.php, no Kernel.php, etc.) for all backend code and advice.

## Service & Repository Pattern

- All business logic must be in service classes. All data access must be in repository classes. Controllers should only coordinate requests and responses. All new features/entities must follow this pattern.

## FormRequest Data Normalization

**Rule:** Always use `prepareForValidation` in Laravel FormRequests to normalize or clean up incoming data before validation, especially for conditional or optional fields. This ensures robust backend validation and prevents frontend quirks from causing errors.

**Note:** Only apply this rule to new or updated FormRequests as you work on them. Do not immediately refactor all existing FormRequests to avoid unnecessary risk and slowdowns.

## Formatting and Encoding

- Always apply proper formatting (consistent indentation, spacing, and line endings) to all Laravel and React code.
- Ensure all files are saved as UTF-8 (without BOM).
- Use the project's formatting standards and tools (e.g., Ctrl+Shift+F in VS Code) before saving or committing changes.
- This prevents hidden/invisible character issues and ensures compatibility with tools like Tinker and the IDE.

## Code Comment Style Guidelines

**Target Audience:** Experienced developers who understand basic concepts.

### Comment Principles:

1. **Focus on the why** - Explain the intention or purpose behind a particular section of code
2. **Be concise and specific** - Avoid verbose or conversational comments; get to the point
3. **Use natural language** - Employ everyday language, avoiding overly technical jargon unless necessary
4. **Provide context** - Relate comments directly to the specific code block and provide relevant context
5. **Avoid redundancy** - Don't comment on information already clear from the code itself
6. **Add value** - Focus on explaining aspects that might not be immediately obvious

### Examples:

```javascript
// ❌ Redundant - obvious from code
const schedules = schedules.filter(schedule => schedule.isActive);

// ✅ Valuable - explains business logic
// Filter out inactive schedules to prevent booking conflicts

// ❌ Overly verbose
// This function takes the selected dates and filters them to only include dates that are in the future
// and don't have any existing schedules that would conflict with the current time selection

// ✅ Concise and specific
// Filter dates to only include future dates without schedule conflicts
```

## Accessibility Guidelines

### Color Blindness Considerations
**Rule:** Always design with color blindness in mind. Use both color AND shape/symbol indicators for important information.

### Implementation Requirements:
1. **Color + Shape Indicators**: Use both color coding and distinct shapes/symbols for schedule types
   - Single: Blue + Circle (●)
   - Weekly: Green + Square (■) 
   - Monthly: Orange + Diamond (◆)

2. **High Contrast Ratios**: Ensure sufficient contrast between text and background colors
   - Minimum 4.5:1 ratio for normal text
   - Minimum 3:1 ratio for large text

3. **Alternative Text**: Provide descriptive aria-labels for screen readers
   - Example: `aria-label="Single schedule at 9:00 AM"`

4. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
   - Use `tabIndex={0}` for clickable elements
   - Provide focus indicators

5. **Semantic HTML**: Use proper HTML elements and ARIA attributes
   - `role="button"` for clickable divs
   - `aria-pressed` for toggle states
   - `aria-label` for descriptive text

## Role-Based UI/Menu Rules

### Super Admin (role_id = 1)

- Intended for development and testing only.
- Can see all admin menu items, including:
  - Dashboard
  - Users
  - Schedules
  - Bookings
  - Groups
  - Subjects
  - Email Blasts
  - (Optionally) Topics

### Tutor (role_id = 2)

- Main operator/manager of the platform.
- Should see and manage:
  - Dashboard
  - Users
  - Schedules
  - Bookings
  - Groups
  - Subjects
  - My Topics
  - Email Blasts
- Should NOT see super admin-only features.

**Note:** Whenever roles or menu logic change, update both backend policies and frontend menu logic to keep them in sync.

## Variable Usage

- Do not create unnecessary or unused variables in tests or production code.
- All variables should have a clear purpose and be used in the logic or assertions.

## API Resource Serialization

**Rule:** When using Laravel API resources, always explicitly include computed accessors (like `getNameAttribute`) in the resource array if you want them available on the frontend. Eloquent accessors are not included by default in resource serialization. This prevents missing data and ensures consistency between backend and frontend.

## CRUD and Entity Relationship Reference

- When implementing a CRUD feature, use the Groups functionality as the primary reference for structure and flow.
- For features involving parent-child or nested entities, use the Subjects and Topics features as the reference implementation.

## Confirmation Dialogs

- All confirmation dialogs (especially for destructive or critical actions) must use the project’s ConfirmationModal component, not browser prompts (e.g., window.confirm).

## SPA Compliance

- All navigation, sorting, and form actions must use Inertia’s router methods (`router.get`, `router.post`, etc.) or `<Link>`. Do not use direct browser navigation (`window.location`, `window.history`, `<a href=...>`) except for external links. All new code must maintain SPA behavior for both frontend and backend processes.
- All Cancel buttons must use normal capitalization (only the first letter capitalized) and must not use forced uppercase styling. This ensures UI consistency across the application.
- All tooltips in the application must use a light blue background color for visual consistency and accessibility.
- Always use the Ziggy route() helper for all backend route generation in frontend code. Ensure Ziggy is set up globally in bootstrap.js for consistency and maintainability.
- Always use Carbon for all date/time handling in Laravel backend code. Always store times in UTC and convert to local time for display. Ensure both frontend and backend handle timezone conversion for security and consistency.
- At the start of every session, the assistant will explicitly state that all general and development rules, reminders, and coding standards will be followed for all work in that session.
- All interactive UI features (e.g., tooltips, modals, menus) must be implemented with accessibility (keyboard, ARIA) and device compatibility (touch, mobile, tablet) in mind. Always test and support both pointer and touch interactions.

## Single Source of Truth (SSOT) for Backend Submission

- When sending data to the backend, always use the Single Source of Truth (SSOT) pattern. All data to be submitted must be derived from a single, canonical state object or array, ensuring consistency, easier validation, and maintainability.

## Feature Review Checklist

- When reviewing or implementing any feature, always check that the frontend uses the Single Source of Truth (SSOT) approach for data sent to the backend. If not, refactor or recommend changes to ensure SSOT is followed.

## Future Enhancements

- Refactor all forms and features to use the SSOT pattern for backend submission, ensuring consistency and maintainability.

### Minimalist UI/UX

- Always prefer a minimalist approach in UI/UX. Keep interfaces clean, avoid unnecessary visual clutter, and prioritize clarity and simplicity. Only show essential information and controls on each page or step. This rule applies to all new features and refactors.

### Loading Notifications

- All loading notifications must use snackbar-style alerts positioned in the lower left corner of the screen (fixed bottom-4 left-4).
- Use the Alert component with variant="loading" for consistent styling.
- Loading snackbars should auto-dismiss when loading completes.
- This provides a non-intrusive, modern UX that doesn't block user interaction.
