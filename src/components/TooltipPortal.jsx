// src/components/TooltipPortal.jsx
import { createPortal } from 'react-dom';

const tooltipRoot = document.getElementById('tooltip-root');

const TooltipPortal = ({ children }) => {
  return tooltipRoot ? createPortal(children, tooltipRoot) : null;
};

export default TooltipPortal;
