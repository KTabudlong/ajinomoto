# Import/Export Rules for Laravel/Inertia.js Components

## 🚨 **CRITICAL RULE: Always Check Export Type Before Importing**

When working with components in this application, **ALWAYS** check the export type before writing import statements.

## 📋 **Step-by-Step Import Checklist**

### 1. **Check Export Type First**

Before writing any import statement, examine the component file:

```javascript
// Check the end of the component file
export default function ComponentName() { ... }  // ← Default export
export function ComponentName() { ... }          // ← Named export
```

### 2. **Follow Import Order with Whitespace**

Always organize imports in this order with whitespace separation:

```javascript
// 1. React libraries first
import React, { useState, useEffect } from 'react';
import { Link, useForm, router } from '@inertiajs/react';

// 2. Whitespace line

// 3. Third-party libraries
import { ChevronDown, Mail, Users } from 'lucide-react';
import pickBy from 'lodash/pickBy';
import classNames from 'classnames';

// 4. Whitespace line

// 5. Local components (check export type!)
import MainLayout from '@/Layouts/MainLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { CheckboxInput } from '@/Components/Form/CheckboxInput';
```

### 3. **Use Correct Import Syntax**

#### **For Default Exports:**

```javascript
// ✅ Correct
import ComponentName from '@/Components/ComponentName';

// ❌ Incorrect
import { ComponentName } from '@/Components/ComponentName';
```

#### **For Named Exports:**

```javascript
// ✅ Correct
import { ComponentName } from '@/Components/ComponentName';

// ❌ Incorrect
import ComponentName from '@/Components/ComponentName';
```

## 🔍 **Common Components in This Application**

### **Default Exports (Use `import ComponentName from`):**

- `PrimaryButton` - `@/Components/PrimaryButton`
- `SecondaryButton` - `@/Components/SecondaryButton`
- `DangerButton` - `@/Components/DangerButton`
- `TextInput` - `@/Components/Form/TextInput`
- `InputLabel` - `@/Components/InputLabel`
- `SearchBar` - `@/Components/SearchBar/SearchBar`
- `Table` - `@/Components/Table/Table`
- `Pagination` - `@/Components/Pagination/Pagination`
- `WysiwygEditor` - `@/Components/Form/WysiwygEditor`
- `MainLayout` - `@/Layouts/MainLayout`
- `AuthenticatedLayout` - `@/Layouts/AuthenticatedLayout`

### **Named Exports (Use `import { ComponentName } from`):**

- `CheckboxInput` - `@/Components/Form/CheckboxInput`
- `InputError` - `@/Components/InputError`

## 📚 **Common Third-Party Libraries**

### **Icons & UI**

- `lucide-react` - Icons (ChevronDown, Mail, Users, etc.)
- `react-quill` - WYSIWYG Editor

### **Utilities**

- `lodash/pickBy` - Object filtering
- `classnames` - Conditional CSS classes
- `react-use` - React hooks (usePrevious)

### **Inertia.js**

- `@inertiajs/react` - Link, useForm, router, usePage

## 🛠️ **Quick Verification Method**

### **Method 1: Check File Structure**

```bash
# Look at the end of the component file
tail -5 resources/js/Components/ComponentName.jsx
```

### **Method 2: IDE/Editor Features**

- Use your IDE's "Go to Definition" feature
- Hover over the component name to see export type
- Use TypeScript-like features if available

### **Method 3: Console Testing**

```javascript
// In browser console, try importing
import ComponentName from '@/Components/ComponentName';
// If it works → Default export
// If it fails → Named export
```

## ⚠️ **Common Error Patterns**

### **Error: "does not provide an export named"**

```javascript
// ❌ This causes the error
import { SearchBar } from '@/Components/SearchBar/SearchBar';

// ✅ Fix: Use default import
import SearchBar from '@/Components/SearchBar/SearchBar';
```

### **Error: "has no default export"**

```javascript
// ❌ This causes the error
import CheckboxInput from '@/Components/Form/CheckboxInput';

// ✅ Fix: Use named import
import { CheckboxInput } from '@/Components/Form/CheckboxInput';
```

## 📝 **Template for New Components**

### **When Creating Default Export Components:**

```javascript
// ComponentName.jsx
export default function ComponentName({ prop1, prop2, ...props }) {
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

### **When Creating Named Export Components:**

```javascript
// ComponentName.jsx
export function ComponentName({ prop1, prop2, ...props }) {
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

## 🔄 **Migration Checklist**

When updating existing components or creating new ones:

1. **Check existing export pattern** in the component file
2. **Verify import statements** in all files using the component
3. **Update imports** if export type changes
4. **Test the component** to ensure it renders correctly
5. **Check for console errors** related to imports
6. **Run linter check** to identify and fix any code quality issues

## 🧹 **Post-Generation Linter Check**

**After generating any new code or making changes:**

### **Step 1: Run Linter**

```bash
# Check for linting errors
npm run lint

# Or if using ESLint directly
npx eslint resources/js/ --ext .js,.jsx
```

### **Step 2: Fix Common Linter Issues**

#### **Most Common Issues:**

**Import/Export Mismatches:**

```javascript
// ❌ Error: does not provide an export named
import { SearchBar } from '@/Components/SearchBar/SearchBar';

// ✅ Fix: Use default import
import SearchBar from '@/Components/SearchBar/SearchBar';
```

**Unused Variables/Imports:**

```javascript
// ❌ Linter warning: 'unusedVariable' is assigned a value but never used
const unusedVariable = 'something';

// ✅ Fix: Remove or use the variable
// Remove if not needed, or add underscore prefix: _unusedVariable
```

**Missing Dependencies in useEffect:**

```javascript
// ❌ Linter warning: Missing dependency 'count'
useEffect(() => {
  console.log(count);
}, []); // Missing 'count' in dependency array

// ✅ Fix: Add missing dependency
useEffect(() => {
  console.log(count);
}, [count]);
```

**Prop Validation Warnings:**

```javascript
// ❌ Linter warning: 'prop' is missing in props validation
function Component({ prop }) {
  return <div>{prop}</div>;
}

// ✅ Fix: Add PropTypes or use TypeScript
Component.propTypes = {
  prop: PropTypes.string.isRequired
};
```

**Accessibility Issues:**

```javascript
// ❌ Linter warning: Elements with the 'button' interactive role must be accessible
<div onClick={handleClick}>Click me</div>

// ✅ Fix: Add proper accessibility attributes
<div 
  onClick={handleClick} 
  role="button" 
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

### **Step 3: Verify Fixes**

```bash
# Run linter again to confirm fixes
npm run lint
```

### **Step 4: Check Browser Console**

- Open browser developer tools
- Look for JavaScript errors
- Test component functionality

## 🎯 **Best Practices**

### **Import Organization**

- **Always follow the import order**: React → Whitespace → Third-party → Whitespace → Local
- **Use whitespace separation** between import groups for readability
- **Group related imports** within each section (e.g., all Inertia.js imports together)
- **Alphabetize imports** within each group when possible

### **Consistency**

- Stick to one export pattern per component
- Document export type in component comments
- Use consistent naming conventions

### **Validation**

- Always test imports after making changes
- Use ESLint rules for import validation
- Check browser console for import errors

### **Documentation**

- Update this list when adding new components
- Document export patterns in component files
- Keep import examples in component documentation

## 🚀 **Quick Reference**

| Component Type | Import Syntax            | Example                                                             |
| -------------- | ------------------------ | ------------------------------------------------------------------- |
| Default Export | `import Name from`     | `import SearchBar from '@/Components/SearchBar/SearchBar'`        |
| Named Export   | `import { Name } from` | `import { CheckboxInput } from '@/Components/Form/CheckboxInput'` |

## ⚡ **Emergency Fix Pattern**

If you encounter import errors:

1. **Identify the component** causing the error
2. **Check its export type** (default vs named)
3. **Update import statement** accordingly
4. **Organize imports** following the order: React → Whitespace → Third-party → Whitespace → Local
5. **Run linter check** to catch any remaining issues
6. **Test the fix** immediately
7. **Update this documentation** if needed

---

**Remember: When in doubt, check the export type first!**
