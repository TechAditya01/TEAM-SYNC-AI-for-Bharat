import React from 'react';

const stripMotionProps = (props) => {
  const {
    initial,
    animate,
    exit,
    transition,
    variants,
    whileHover,
    whileTap,
    whileInView,
    viewport,
    layout,
    layoutId,
    drag,
    dragConstraints,
    dragElastic,
    onAnimationComplete,
    onViewportEnter,
    onViewportLeave,
    ...rest
  } = props;

  return rest;
};

const createMotionTag = (tag) =>
  React.forwardRef(({ children, ...props }, ref) => {
    const safeProps = stripMotionProps(props);
    return React.createElement(tag, { ref, ...safeProps }, children);
  });

export const motion = new Proxy(
  {},
  {
    get: (_target, tag) => createMotionTag(tag),
  }
);

export const AnimatePresence = ({ children }) =>
  React.createElement(React.Fragment, null, children);
