'use client';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface PlaceholderProps {
  /**
   * Icon to display in the placeholder
   * @default ExclamationTriangleIcon
   */
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;

  /**
   * Title text to display
   * @default "Coming Soon"
   */
  title?: string;

  /**
   * Description text to display
   * @default "This section is under development."
   */
  description?: string;

  /**
   * Custom className for additional styling
   */
  className?: string;

  /**
   * Size variant for the placeholder
   * @default "medium"
   */
  size?: 'small' | 'medium' | 'large';
}

const PlaceholderComponent: React.FC<PlaceholderProps> = ({
  icon: IconComponent = ExclamationTriangleIcon,
  title = 'Coming Soon',
  description = '',
  className = '',
  size = 'medium',
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      container: 'py-8',
      icon: 'w-12 h-12',
      title: 'text-lg',
      description: 'text-sm',
    },
    medium: {
      container: 'py-12',
      icon: 'w-16 h-16',
      title: 'text-xl',
      description: 'text-base',
    },
    large: {
      container: 'py-16',
      icon: 'w-20 h-20',
      title: 'text-2xl',
      description: 'text-lg',
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 ${className}`}>
      <div className={`text-center ${config.container}`}>
        <IconComponent className={`${config.icon} text-gray-400 mx-auto mb-4`} />
        <h3 className={`${config.title} font-medium text-gray-900 dark:text-white mb-2`}>
          {title}
        </h3>
        <p className={`${config.description} text-gray-600 dark:text-gray-400`}>{description}</p>
      </div>
    </div>
  );
};

export default PlaceholderComponent;
