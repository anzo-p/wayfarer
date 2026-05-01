import type { CSSProperties, ReactNode } from 'react';

import './styles.css';

interface ResponsiveSplitLayoutProps {
  major: ReactNode;
  minor: ReactNode;
  toolbar?: ReactNode;
}

const layoutStyles: CSSProperties = {
  display: 'flex',
  height: '100vh'
};

const majorStyles: CSSProperties = {
  backgroundColor: 'lightblue',
  width: '100%',
  height: '100%'
};

const minorStyles: CSSProperties = {
  width: '200px'
};

export default function ResponsiveSplitLayout({ major, minor, toolbar }: ResponsiveSplitLayoutProps) {
  return (
    <div className="responsiveSplitLayout" style={layoutStyles}>
      {toolbar && <div className="responsiveSplitLayout__toolbar">{toolbar}</div>}
      <div className="responsiveSplitLayout__major" style={majorStyles}>
        {major}
      </div>
      <div style={minorStyles}>{minor}</div>
    </div>
  );
}
