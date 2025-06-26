'use client';

import { Backdrop, Box, CircularProgress, LinearProgress, Typography } from '@mui/material';
import React from 'react';

export type LoaderType = 'circular' | 'linear';
export type LoaderSize = 'small' | 'medium' | 'large';
export type LoaderVariant = 'determinate' | 'indeterminate';

interface LoaderProps {
  /**
   * Type of loader to display
   * @default 'circular'
   */
  type?: LoaderType;

  /**
   * Size of the loader
   * @default 'medium'
   */
  size?: LoaderSize;

  /**
   * Variant of the progress indicator
   * @default 'indeterminate'
   */
  variant?: LoaderVariant;

  /**
   * Progress value (0-100) when variant is 'determinate'
   */
  value?: number;

  /**
   * Optional loading message to display
   */
  message?: string;

  /**
   * Whether to show as fullscreen overlay
   * @default false
   */
  overlay?: boolean;

  /**
   * Custom color for the progress indicator
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';

  /**
   * Custom className for styling
   */
  className?: string;

  /**
   * Whether the backdrop should be clickable (only when overlay=true)
   * @default false
   */
  disableBackdropClick?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  type = 'circular',
  size = 'medium',
  variant = 'indeterminate',
  value,
  message,
  overlay = false,
  color = 'primary',
  className = '',
  disableBackdropClick = false,
}) => {
  // Size mappings for different loader types
  const getSizeValue = () => {
    if (type === 'circular') {
      switch (size) {
        case 'small':
          return 24;
        case 'medium':
          return 40;
        case 'large':
          return 60;
        default:
          return 40;
      }
    }
    return undefined; // LinearProgress doesn't use size prop
  };

  // Get thickness for circular progress
  const getThickness = () => {
    switch (size) {
      case 'small':
        return 4;
      case 'medium':
        return 4;
      case 'large':
        return 4.5;
      default:
        return 4;
    }
  };

  // Render the appropriate progress component
  const renderProgress = () => {
    if (type === 'linear') {
      return (
        <LinearProgress
          variant={variant}
          value={variant === 'determinate' ? value : undefined}
          color={color}
          sx={{
            width: '100%',
            height: size === 'small' ? 4 : size === 'large' ? 8 : 6,
            borderRadius: size === 'large' ? 4 : 2,
          }}
        />
      );
    }

    return (
      <CircularProgress
        variant={variant}
        value={variant === 'determinate' ? value : undefined}
        size={getSizeValue()}
        thickness={getThickness()}
        color={color}
      />
    );
  };

  // Main loader content
  const loaderContent = (
    <Box
      className={`flex flex-col items-center justify-center ${className}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: message ? 2 : 0,
        padding: message ? 2 : 1,
      }}
    >
      {renderProgress()}

      {message && (
        <Typography
          variant={size === 'small' ? 'body2' : size === 'large' ? 'h6' : 'body1'}
          color='textSecondary'
          align='center'
          sx={{
            marginTop: type === 'linear' ? 1 : 0,
            fontWeight: size === 'large' ? 500 : 400,
          }}
        >
          {message}
        </Typography>
      )}

      {variant === 'determinate' && typeof value === 'number' && (
        <Typography variant='caption' color='textSecondary' sx={{ marginTop: 0.5 }}>
          {Math.round(value)}%
        </Typography>
      )}
    </Box>
  );

  // Return with or without overlay
  if (overlay) {
    return (
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: theme => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        open={true}
        onClick={disableBackdropClick ? undefined : () => {}}
      >
        {loaderContent}
      </Backdrop>
    );
  }

  return loaderContent;
};

export default Loader;
