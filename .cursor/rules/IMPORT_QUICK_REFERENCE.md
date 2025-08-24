# 🚀 Import Quick Reference Card

## ⚡ **Before Every Import - CHECK EXPORT TYPE!**

```bash
# Quick check: Look at the end of component file
tail -3 resources/js/Components/ComponentName.jsx
```

## 📋 **Import Order with Whitespace**

```javascript
// 1. React libraries first
import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';

// 2. Whitespace line

// 3. Third-party libraries  
import { ChevronDown } from 'lucide-react';
import pickBy from 'lodash/pickBy';

// 4. Whitespace line

// 5. Local components (check export type!)
import MainLayout from '@/Layouts/MainLayout';
import { CheckboxInput } from '@/Components/Form/CheckboxInput';
```

## 📋 **Import Patterns**

| Export Type              | Import Syntax            | Example                                                             |
| ------------------------ | ------------------------ | ------------------------------------------------------------------- |
| **Default Export** | `import Name from`     | `import SearchBar from '@/Components/SearchBar/SearchBar'`        |
| **Named Export**   | `import { Name } from` | `import { CheckboxInput } from '@/Components/Form/CheckboxInput'` |

## 🔍 **Common Components - This App**

### **Default Exports** (Use `import Name from`)

```
PrimaryButton, SecondaryButton, DangerButton
TextInput, InputLabel, SearchBar
Table, Pagination, WysiwygEditor
MainLayout, AuthenticatedLayout
```

### **Named Exports** (Use `import { Name } from`)

```
CheckboxInput, InputError
```

## ⚠️ **Error Patterns & Fixes**

| Error Message                        | Wrong Import             | Correct Import           |
| ------------------------------------ | ------------------------ | ------------------------ |
| `does not provide an export named` | `import { Name } from` | `import Name from`     |
| `has no default export`            | `import Name from`     | `import { Name } from` |

## 🎯 **4-Step Fix Process**

1. **Check**: Look at component file's export statement
2. **Fix**: Update import syntax accordingly
3. **Lint**: Run `npm run lint` to catch any issues
4. **Test**: Verify component renders without errors

## 🧹 **Post-Generation Checklist**

```bash
# After generating any code:
npm run lint                    # Check for linting errors
npm run build                   # Verify build process
# Open browser and test functionality
```

---

**💡 Pro Tip: When in doubt, check the export type first!**
