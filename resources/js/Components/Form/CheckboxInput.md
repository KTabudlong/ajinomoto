# CheckboxInput Component

A customizable checkbox component that follows SOLID principles, particularly the Single Responsibility Principle and Open/Closed Principle.

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)
- **Single purpose**: Renders a styled checkbox with label
- **Color variants**: Handled by dedicated function
- **Size variants**: Handled by dedicated function
- **No business logic**: Pure presentation component

### Open/Closed Principle (OCP)
- **Open for extension**: New variants and sizes can be added
- **Closed for modification**: Existing code unchanged
- **Customizable**: Via props and className

### Dependency Inversion Principle (DIP)
- **Props-based**: Depends on abstractions (props)
- **Testable**: Easy to mock and test
- **Reusable**: Can be used anywhere in the application

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | required | The label text for the checkbox |
| `name` | string | required | The name attribute for the checkbox |
| `variant` | string | 'indigo' | Color variant |
| `size` | string | 'md' | Size variant |
| `disabled` | boolean | false | Disabled state |
| `className` | string | '' | Additional CSS classes for the label |
| `labelClassName` | string | '' | Additional CSS classes for the label text |
| `checked` | boolean | false | Checked state |
| `onChange` | function | required | Change handler |

## Color Variants

All variants follow a consistent pattern:
- `text-{color}-600` - Checkbox color
- `focus:ring-{color}-600` - Focus ring color

Available colors:
- `indigo` (default) - Matches main theme
- `blue` - Blue accent
- `green` - Green accent
- `red` - Red accent
- `yellow` - Yellow accent
- `purple` - Purple accent
- `gray` - Gray accent

## Size Variants

| Size | Checkbox Size | Label Size | Spacing |
|------|---------------|------------|---------|
| `sm` | w-3 h-3 | text-xs | mr-2 |
| `md` (default) | w-4 h-4 | text-sm | mr-2 |
| `lg` | w-5 h-5 | text-base | mr-3 |

## Usage Examples

### Basic Usage
```jsx
<CheckboxInput
    name="save_template"
    label="Save as Template"
    checked={data.save_template}
    onChange={(e) => setData('save_template', e.target.checked)}
/>
```

### With Color Variant
```jsx
<CheckboxInput
    name="terms"
    label="I agree to the terms and conditions"
    variant="green"
    checked={data.terms}
    onChange={(e) => setData('terms', e.target.checked)}
/>
```

### With Size Variant
```jsx
<CheckboxInput
    name="notifications"
    label="Receive email notifications"
    size="lg"
    checked={data.notifications}
    onChange={(e) => setData('notifications', e.target.checked)}
/>
```

### Disabled State
```jsx
<CheckboxInput
    name="premium"
    label="Premium features"
    disabled={true}
    checked={false}
/>
```

### With Custom Styling
```jsx
<CheckboxInput
    name="newsletter"
    label="Subscribe to newsletter"
    variant="blue"
    size="sm"
    className="mb-4"
    labelClassName="font-medium"
    checked={data.newsletter}
    onChange={(e) => setData('newsletter', e.target.checked)}
/>
```

### Multiple Checkboxes with Different Variants
```jsx
<div className="space-y-2">
    <CheckboxInput
        name="email_notifications"
        label="Email notifications"
        variant="blue"
        checked={data.email_notifications}
        onChange={(e) => setData('email_notifications', e.target.checked)}
    />
    
    <CheckboxInput
        name="sms_notifications"
        label="SMS notifications"
        variant="green"
        checked={data.sms_notifications}
        onChange={(e) => setData('sms_notifications', e.target.checked)}
    />
    
    <CheckboxInput
        name="push_notifications"
        label="Push notifications"
        variant="purple"
        checked={data.push_notifications}
        onChange={(e) => setData('push_notifications', e.target.checked)}
    />
</div>
```

## Migration Guide

### Before (Basic Implementation)
```jsx
<div className="flex items-center">
    <input
        type="checkbox"
        id="save_template"
        name="save_template"
        className="mr-2 rounded text-indigo-600 focus:ring-indigo-600"
        checked={data.save_template}
        onChange={(e) => setData('save_template', e.target.checked)}
    />
    <label htmlFor="save_template" className="text-sm">
        Save as Template
    </label>
</div>
```

### After (CheckboxInput Component)
```jsx
<CheckboxInput
    name="save_template"
    label="Save as Template"
    checked={data.save_template}
    onChange={(e) => setData('save_template', e.target.checked)}
/>
```

## Best Practices

1. **Use consistent variants** - Choose appropriate colors for different contexts
2. **Maintain accessibility** - Always provide meaningful labels
3. **Use appropriate sizes** - Match the size to the context (forms, tables, etc.)
4. **Handle disabled states** - Provide visual feedback for disabled checkboxes
5. **Group related checkboxes** - Use consistent spacing and styling
6. **Test all variants** - Ensure all color and size combinations work correctly

## Accessibility Features

- **Proper label association** - Uses `htmlFor` attribute
- **Keyboard navigation** - Supports Tab and Space keys
- **Focus indicators** - Clear focus rings for all variants
- **Disabled states** - Visual and functional disabled state
- **Screen reader friendly** - Proper ARIA attributes

## Testing Examples

```jsx
// Test basic functionality
<CheckboxInput
    name="test"
    label="Test checkbox"
    checked={false}
    onChange={jest.fn()}
/>

// Test with all props
<CheckboxInput
    name="test"
    label="Test checkbox"
    variant="green"
    size="lg"
    disabled={false}
    className="custom-class"
    labelClassName="custom-label-class"
    checked={true}
    onChange={jest.fn()}
/>
```

## Future Extensions

The component is designed to be easily extended:

### Adding New Color Variants
```jsx
// In getVariantClasses function
case 'orange':
    return 'text-orange-600 focus:ring-orange-600';
```

### Adding New Size Variants
```jsx
// In getSizeClasses function
case 'xl':
    return 'w-6 h-6 mr-4';
```

### Adding New Features
- Custom icons
- Indeterminate state
- Custom animations
- Validation states 