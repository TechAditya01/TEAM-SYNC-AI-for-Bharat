import React from 'react';

export const useJsApiLoader = () => ({
  isLoaded: true,
  loadError: null,
});

export const GoogleMap = ({ children, mapContainerStyle, className, style, ...rest }) => {
  const mergedStyle = {
    width: '100%',
    height: '100%',
    ...(mapContainerStyle || {}),
    ...(style || {}),
  };

  return React.createElement(
    'div',
    {
      className,
      style: mergedStyle,
      ...rest,
    },
    children
  );
};

export const Marker = () => null;

export const OverlayView = ({ children }) => React.createElement(React.Fragment, null, children);

export const InfoWindow = ({ children }) => React.createElement(React.Fragment, null, children);

export const Autocomplete = ({ children }) => React.createElement(React.Fragment, null, children);
