import { ReactNode, useEffect, useState } from 'react';

interface ResponsiveMajorMinorProps {
  major: ReactNode;
  minor: ReactNode;
  toolbar?: ReactNode;
}

const landscapeStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  height: '100vh'
};

const portraitStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh'
};

const majorStyles = (isLandscape: boolean): React.CSSProperties =>
  isLandscape
    ? { backgroundColor: 'lightblue', width: `100%`, height: '100%' }
    : { backgroundColor: 'lightblue', width: '100%', height: `calc(100vh * 0.618)` };

const minorStyles: React.CSSProperties = {
  width: '200px'
};

const overlayToolbarStyle: React.CSSProperties = {
  position: 'absolute',
  top: '15px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  padding: '5px 5px',
  borderRadius: '8px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
  zIndex: 1
};

const navBarToolbarStyles: React.CSSProperties = {
  width: '100%',
  height: '35px',
  color: 'white',
  padding: '10px 20px',
  boxSizing: 'border-box'
};

const ResponsiveMajorMinor: React.FC<ResponsiveMajorMinorProps> = ({ major, minor, toolbar }) => {
  const [isLandscape, setIsLandscape] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const getWindowShape = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
      setIsNarrow(window.innerWidth < 700);
    };
    getWindowShape();

    window.addEventListener('resize', getWindowShape);

    return () => window.removeEventListener('resize', getWindowShape);
  }, []);

  return (
    <div style={isLandscape ? landscapeStyles : portraitStyles}>
      {isNarrow && toolbar && <div style={navBarToolbarStyles}>{toolbar}</div>}
      <div style={majorStyles(isLandscape)}>{major}</div>
      {!isNarrow && toolbar && <div style={overlayToolbarStyle}>{toolbar}</div>}
      <div style={minorStyles}>{minor}</div>
    </div>
  );
};

export default ResponsiveMajorMinor;
