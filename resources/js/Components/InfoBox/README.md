# InfoBox Component

A reusable, SOLID-principle compliant information display component for React applications.

## 🎯 SOLID Principles Implementation

### **S - Single Responsibility Principle**
- **Responsibility**: Only displays informational content with consistent styling
- **No Side Effects**: Pure component that doesn't handle business logic
- **Focused Purpose**: One reason to change - information display styling

### **O - Open/Closed Principle**
- **Open for Extension**: New types can be added via props without modifying the component
- **Closed for Modification**: Core functionality doesn't need to change for new use cases
- **Extensible Design**: Color schemes, icons, and content can be customized

### **L - Liskov Substitution Principle**
- **Interchangeable**: Can be used anywhere an info box is needed
- **Consistent Interface**: Same props work across all use cases
- **Predictable Behavior**: Always renders the same way given the same props

### **I - Interface Segregation Principle**
- **Minimal Props**: Only requires the props it actually uses
- **Optional Props**: Most props are optional with sensible defaults
- **Focused Interface**: No unnecessary dependencies or requirements

### **D - Dependency Inversion Principle**
- **Props-Based**: Depends on abstractions (props) not concrete implementations
- **No Hard Dependencies**: Doesn't depend on specific business logic
- **Inversion of Control**: Parent components control the behavior

## 📦 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | The type of information box |
| `title` | `string` | `undefined` | The title text to display |
| `message` | `string` | `undefined` | The main message text |
| `icon` | `ReactNode` | `undefined` | Custom icon (overrides default) |
| `className` | `string` | `''` | Additional CSS classes |
| `children` | `ReactNode` | `undefined` | Additional content to display |

## 🎨 Types & Colors

### Info (Blue)
- Background: `bg-blue-50`
- Border: `border-blue-200`
- Icon: `text-blue-400`
- Title: `text-blue-700`
- Message: `text-blue-600`

### Success (Green)
- Background: `bg-green-50`
- Border: `border-green-200`
- Icon: `text-green-400`
- Title: `text-green-700`
- Message: `text-green-600`

### Warning (Yellow)
- Background: `bg-yellow-50`
- Border: `border-yellow-200`
- Icon: `text-yellow-400`
- Title: `text-yellow-700`
- Message: `text-yellow-600`

### Error (Red)
- Background: `bg-red-50`
- Border: `border-red-200`
- Icon: `text-red-400`
- Title: `text-red-700`
- Message: `text-red-600`

## 📝 Usage Examples

### Basic Usage
```jsx
import { InfoBox } from '@/Components/InfoBox';

<InfoBox
    type="info"
    title="Information"
    message="This is a basic information message."
/>
```

### Success Message
```jsx
<InfoBox
    type="success"
    title="Success!"
    message="Your action was completed successfully."
/>
```

### With Custom Icon
```jsx
<InfoBox
    type="info"
    title="Custom Icon"
    message="This uses a custom icon."
    icon={<CustomIcon />}
/>
```

### With Complex Content
```jsx
<InfoBox
    type="error"
    title="Validation Errors"
    message="Please fix the following issues:"
>
    <ul className="list-disc list-inside">
        <li>Email is required</li>
        <li>Password must be at least 8 characters</li>
    </ul>
</InfoBox>
```

### Template Usage (Email Blast Create)
```jsx
<InfoBox
    type="info"
    title={`Using saved template: ${templateName}`}
    message="The 'Save as Template' option is hidden because you're using an existing template."
/>
```

## 🔧 Customization

### Adding New Types
The component is designed to be easily extended. To add a new type:

1. Add the type to the `colorSchemes` object
2. Add a default icon to the `defaultIcons` object
3. The component will automatically handle the new type

### Custom Styling
Use the `className` prop to add custom styles:

```jsx
<InfoBox
    type="info"
    title="Custom Styled"
    message="This has custom styling."
    className="my-custom-class"
/>
```

## 🚀 Benefits

### **Reusability**
- Can be used anywhere in the application
- Consistent styling across all uses
- Reduces code duplication

### **Maintainability**
- Single source of truth for info box styling
- Easy to update all info boxes at once
- Clear separation of concerns

### **Flexibility**
- Supports multiple types and customizations
- Extensible design for future needs
- Works with any content structure

### **Accessibility**
- Semantic HTML structure
- Proper color contrast ratios
- Screen reader friendly

## 📁 File Structure

```
InfoBox/
├── InfoBox.jsx          # Main component
├── index.js            # Export file
├── InfoBoxExamples.jsx # Usage examples
└── README.md           # Documentation
```

## 🎯 Best Practices

1. **Use Appropriate Types**: Choose the right type for your message
2. **Keep Messages Concise**: Short, clear messages work best
3. **Use Children for Complex Content**: Use the children prop for lists or complex content
4. **Consistent Usage**: Use the same type for similar messages across the app
5. **Accessibility**: Ensure your content is accessible to all users

## 🔄 Migration from Inline Info Boxes

To migrate from inline info boxes to this component:

1. Replace inline JSX with InfoBox component
2. Map existing styles to appropriate types
3. Extract title and message from existing content
4. Use children prop for complex content
5. Test across different screen sizes 