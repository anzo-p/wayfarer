import { ReactNode, useEffect, useState } from 'react';

interface ResponsiveMajorMinorProps {
  major: ReactNode;
  minor: ReactNode;
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

const ResponsiveMajorMinor: React.FC<ResponsiveMajorMinorProps> = ({ major, minor }) => {
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={isLandscape ? landscapeStyles : portraitStyles}>
      <div style={majorStyles(isLandscape)}>{major}</div>
      <div style={minorStyles}>{minor}</div>
    </div>
  );
};

export default ResponsiveMajorMinor;
