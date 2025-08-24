# Button Components

This directory contains reusable button components that follow SOLID principles, particularly the Single Responsibility Principle and Open/Closed Principle.

## Components

### PrimaryButton
A customizable primary action button with multiple color variants.

#### Props
- `variant` (string): Color variant - 'indigo' (default), 'blue', 'green', 'red', 'yellow', 'purple'
- `disabled` (boolean): Disabled state
- `className` (string): Additional CSS classes
- `children` (ReactNode): Button content
- All standard button props

#### Usage Examples

```jsx
// Default indigo button (matches main menu theme)
<PrimaryButton onClick={handleSubmit}>
  Save Changes
</PrimaryButton>

// Blue variant
<PrimaryButton variant="blue" onClick={handleSubmit}>
  Continue
</PrimaryButton>

// Green variant for success actions
<PrimaryButton variant="green" onClick={handleConfirm}>
  Confirm
</PrimaryButton>

// Red variant for destructive actions
<PrimaryButton variant="red" onClick={handleDelete}>
  Delete
</PrimaryButton>

// With custom className
<PrimaryButton 
  variant="purple" 
  className="w-full sm:w-auto"
  onClick={handleSubmit}
>
  Submit
</PrimaryButton>
```

### SecondaryButton
A customizable secondary action button with multiple color variants. Used for less prominent actions.

#### Props
- `variant` (string): Color variant - 'gray' (default), 'blue', 'green', 'red', 'yellow', 'purple', 'indigo'
- `disabled` (boolean): Disabled state
- `className` (string): Additional CSS classes
- `children` (ReactNode): Button content
- All standard button props

#### Usage Examples

```jsx
// Default gray button (original styling)
<SecondaryButton onClick={handleCancel}>
  Cancel
</SecondaryButton>

// Blue variant
<SecondaryButton variant="blue" onClick={handleUseTemplate}>
  Use Template
</SecondaryButton>

// Green variant for secondary success actions
<SecondaryButton variant="green" onClick={handlePreview}>
  Preview
</SecondaryButton>

// Red variant for secondary destructive actions
<SecondaryButton variant="red" onClick={handleArchive}>
  Archive
</SecondaryButton>

// With custom className
<SecondaryButton 
  variant="indigo" 
  className="w-full sm:w-auto"
  onClick={handleBack}
>
  Back
</SecondaryButton>
```

### LinkButton
A customizable button that renders as a Link component with the same styling as PrimaryButton.

#### Props
- `href` (string): Link destination
- `variant` (string): Color variant - same options as PrimaryButton
- `className` (string): Additional CSS classes
- `children` (ReactNode): Button content
- All standard Link props

#### Usage Examples

```jsx
// Default indigo link button
<LinkButton href={route('users.create')}>
  Create User
</LinkButton>

// Blue variant
<LinkButton 
  href={route('groups.manage-members', group.id)}
  variant="blue"
>
  Manage Members
</LinkButton>

// With custom className
<LinkButton 
  href={route('dashboard')}
  variant="green"
  className="w-full sm:w-auto"
>
  Go to Dashboard
</LinkButton>
```

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)
- Each button component has a single responsibility: rendering a styled button
- Color variants are handled through a dedicated function
- No business logic mixed with presentation

### Open/Closed Principle (OCP)
- Components are open for extension (new variants) but closed for modification
- New color variants can be added without changing existing code
- Custom styling can be applied via className prop

### Dependency Inversion Principle (DIP)
- Components depend on abstractions (props) rather than concrete implementations
- Easy to test and mock

## Color Variants

### PrimaryButton Variants
All variants follow a consistent pattern:
- `bg-{color}-600` - Default background
- `hover:bg-{color}-700` - Hover state
- `focus:bg-{color}-700` - Focus state
- `active:bg-{color}-800` - Active state
- `focus:ring-{color}-500` - Focus ring

Available colors:
- `indigo` (default) - Matches main menu theme
- `blue` - Standard blue
- `green` - Success actions
- `red` - Destructive actions
- `yellow` - Warning actions
- `purple` - Alternative accent

### SecondaryButton Variants
All variants follow a consistent pattern:
- `border-{color}-300` - Border color
- `bg-white` - Background (always white)
- `text-{color}-700` - Text color
- `hover:bg-{color}-50` - Hover background
- `focus:ring-{color}-500` - Focus ring

Available colors:
- `gray` (default) - Original secondary button styling
- `blue` - Blue accent
- `green` - Green accent
- `red` - Red accent
- `yellow` - Yellow accent
- `purple` - Purple accent
- `indigo` - Indigo accent

## Button Usage Guidelines

### When to Use Each Button Type

#### PrimaryButton
- **Primary actions** - Save, Submit, Continue, Confirm
- **Main call-to-action** buttons
- **Destructive actions** - Delete, Remove (with red variant)
- **Success actions** - Approve, Confirm (with green variant)

#### SecondaryButton
- **Secondary actions** - Cancel, Back, Reset
- **Less prominent actions** - Use Template, Preview, Archive
- **Alternative actions** - when there are multiple options
- **Supporting actions** - Help, Info, Settings

#### LinkButton
- **Navigation actions** - Go to page, Create new, Edit
- **External links** - Documentation, Support
- **Menu items** - when styled as buttons

## Migration Guide

### Before (Custom Styling)
```jsx
<button className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 px-4 py-2 text-white rounded">
  Save
</button>
```

### After (PrimaryButton)
```jsx
<PrimaryButton onClick={handleSave}>
  Save
</PrimaryButton>
```

### Before (Custom Secondary Styling)
```jsx
<button className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded">
  Cancel
</button>
```

### After (SecondaryButton)
```jsx
<SecondaryButton onClick={handleCancel}>
  Cancel
</SecondaryButton>
```

### Before (Custom Link Styling)
```jsx
<Link className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
  Create
</Link>
```

### After (LinkButton)
```jsx
<LinkButton href={route('create')}>
  Create
</LinkButton>
```

## Best Practices

1. **Use PrimaryButton for all primary actions** - Maintains consistency
2. **Use SecondaryButton for secondary actions** - Clear visual hierarchy
3. **Use LinkButton for navigation actions** - Proper semantic HTML
4. **Choose appropriate variants** - Use color variants to convey meaning
5. **Keep custom styling minimal** - Use className only when necessary
6. **Follow accessibility guidelines** - Components include proper focus states
7. **Maintain visual hierarchy** - Primary actions should be more prominent than secondary 