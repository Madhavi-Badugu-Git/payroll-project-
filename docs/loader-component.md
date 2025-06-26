# Loader Component Documentation

## Overview

The `Loader` component is a versatile and customizable loading indicator built
with Material-UI (MUI) components. It supports both circular and linear progress
indicators with extensive customization options.

## Features

- ✅ **Two loader types**: Circular and Linear progress indicators
- ✅ **Multiple sizes**: Small, Medium, Large
- ✅ **Progress variants**: Determinate and Indeterminate
- ✅ **Overlay support**: Fullscreen backdrop overlay
- ✅ **Color customization**: All MUI theme colors supported
- ✅ **Loading messages**: Optional text display
- ✅ **Progress percentage**: Automatic percentage display for determinate
  loaders
- ✅ **Responsive design**: Works on all screen sizes
- ✅ **TypeScript support**: Fully typed with comprehensive interfaces

## Installation

Make sure you have the required dependencies installed:

```bash
npm install @mui/material @emotion/react @emotion/styled
```

## Basic Usage

### Default Circular Loader

```tsx
import Loader from '@/components/Loader';

// Basic circular loader (default)
<Loader />;
```

### Linear Loader

```tsx
// Basic linear loader
<Loader type='linear' />
```

## Props API

### `LoaderProps` Interface

| Prop                   | Type                               | Default           | Description                                    |
| ---------------------- | ---------------------------------- | ----------------- | ---------------------------------------------- |
| `type`                 | `'circular' \| 'linear'`           | `'circular'`      | Type of loader to display                      |
| `size`                 | `'small' \| 'medium' \| 'large'`   | `'medium'`        | Size of the loader                             |
| `variant`              | `'determinate' \| 'indeterminate'` | `'indeterminate'` | Progress variant                               |
| `value`                | `number`                           | `undefined`       | Progress value (0-100) for determinate variant |
| `message`              | `string`                           | `undefined`       | Optional loading message                       |
| `overlay`              | `boolean`                          | `false`           | Show as fullscreen overlay                     |
| `color`                | MUI Color                          | `'primary'`       | Color theme for the progress indicator         |
| `className`            | `string`                           | `''`              | Custom CSS class                               |
| `disableBackdropClick` | `boolean`                          | `false`           | Disable backdrop click (overlay only)          |

### Type Definitions

```tsx
export type LoaderType = 'circular' | 'linear';
export type LoaderSize = 'small' | 'medium' | 'large';
export type LoaderVariant = 'determinate' | 'indeterminate';
```

## Usage Examples

### 1. Different Sizes

```tsx
// Small loader
<Loader size="small" />

// Medium loader (default)
<Loader size="medium" />

// Large loader
<Loader size="large" />
```

### 2. With Loading Messages

```tsx
// Circular with message
<Loader message="Loading data..." />

// Linear with message
<Loader type="linear" message="Uploading files..." />
```

### 3. Determinate Progress

```tsx
// Circular progress with percentage
<Loader
  variant="determinate"
  value={75}
  message="Processing..."
/>

// Linear progress with percentage
<Loader
  type="linear"
  variant="determinate"
  value={45}
  message="Download in progress..."
/>
```

### 4. Different Colors

```tsx
// Primary color (default)
<Loader color="primary" />

// Success color
<Loader color="success" />

// Error color
<Loader color="error" />

// Warning color
<Loader color="warning" />

// Info color
<Loader color="info" />

// Secondary color
<Loader color="secondary" />
```

### 5. Fullscreen Overlay

```tsx
// Circular overlay
<Loader
  overlay={true}
  message="Please wait..."
  size="large"
/>

// Linear overlay
<Loader
  type="linear"
  overlay={true}
  message="Processing your request..."
/>
```

### 6. Advanced Usage with State

```tsx
import React, { useState, useEffect } from 'react';
import Loader from '@/components/Loader';

const MyComponent = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async () => {
    setLoading(true);
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div>
      <button onClick={handleUpload}>Start Upload</button>

      {loading && (
        <Loader
          type='linear'
          variant='determinate'
          value={progress}
          message={`Uploading... ${progress}%`}
          size='large'
        />
      )}
    </div>
  );
};
```

## Size Specifications

### Circular Loader Sizes

- **Small**: 24px diameter
- **Medium**: 40px diameter
- **Large**: 60px diameter

### Linear Loader Heights

- **Small**: 4px height
- **Medium**: 6px height
- **Large**: 8px height

## Styling and Customization

### Custom Styling

```tsx
// Using className prop
<Loader className='my-custom-loader' message='Custom styled loader' />
```

### CSS Override Example

```css
.my-custom-loader {
  padding: 20px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
```

## Common Use Cases

### 1. Page Loading

```tsx
{
  isPageLoading && (
    <Loader overlay={true} message='Loading page...' size='large' />
  );
}
```

### 2. API Requests

```tsx
const [isLoading, setIsLoading] = useState(false);

const fetchData = async () => {
  setIsLoading(true);
  try {
    const response = await api.getData();
    // Handle response
  } finally {
    setIsLoading(false);
  }
};

return (
  <div>
    {isLoading ? <Loader message='Fetching data...' /> : <DataComponent />}
  </div>
);
```

### 3. Form Submissions

```tsx
<form onSubmit={handleSubmit}>
  {/* Form fields */}
  <button type='submit' disabled={isSubmitting}>
    {isSubmitting ? <Loader size='small' color='inherit' /> : 'Submit'}
  </button>
</form>
```

### 4. File Uploads

```tsx
{
  isUploading && (
    <Loader
      type='linear'
      variant='determinate'
      value={uploadProgress}
      message={`Uploading file... ${uploadProgress}%`}
    />
  );
}
```

## Best Practices

1. **Use appropriate sizes**: Small for buttons, medium for components, large
   for pages
2. **Provide meaningful messages**: Help users understand what's happening
3. **Use determinate progress when possible**: Show actual progress when
   available
4. **Choose appropriate colors**: Use theme colors that match your design
5. **Consider overlay for blocking operations**: Use overlay for operations that
   should block user interaction
6. **Don't overuse**: Only show loaders when necessary to avoid overwhelming the
   user

## Accessibility

The Loader component is built with accessibility in mind:

- Uses semantic MUI components
- Proper ARIA labels for screen readers
- Keyboard navigation support
- High contrast support
- Follows MUI accessibility guidelines

## Browser Support

The component supports all modern browsers that support:

- React 18+
- Material-UI v5+
- ES6+ features

## Migration from Other Loaders

If you're migrating from other loading components, here's a quick reference:

```tsx
// Old custom spinner
<div className="spinner">Loading...</div>

// New Loader component
<Loader message="Loading..." />

// Old progress bar
<div className="progress-bar" style={{width: '75%'}}></div>

// New Loader component
<Loader type="linear" variant="determinate" value={75} />
```
