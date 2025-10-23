import React from 'react';

export const PartnerLogoPlaceholder = ({ width = 120, height = 34 }) => (
  <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
    <rect width={width} height={height} rx="6" fill="#f5f5f5" stroke="#e0e0e0" />
    <text x={width / 2} y={height / 2 + 4} fill="#9e9e9e" fontSize="12" fontWeight="600" textAnchor="middle">Partner</text>
  </svg>
);

export default null;
