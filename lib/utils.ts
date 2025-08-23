import { clsx, type ClassValue } from 'clsx';
import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const today = () => {
  return new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
}

export const useDimensions = () => {
  const { width: sw, height: sh } = Dimensions.get('screen');
  const [width, setWidth] = useState(sw);
  const [height, setHeight] = useState(sh);

  useEffect(() => {
    const handleResize = () => {
      const dim = Dimensions.get('screen');
      setWidth(dim.width);
      setHeight(dim.height);
    };

    Dimensions.addEventListener('change', handleResize);
  }, []);

  return { width, height };
};