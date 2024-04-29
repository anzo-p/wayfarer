import React from 'react';

const getBannerStyles = (type: BannerTypeEnum): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    width: '99%',
    height: '50px',
    position: 'fixed',
    top: 0,
    left: 0,
    color: '#333',
    padding: '10px',
    boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100
  };

  const backgroundColors = {
    info: '#74b4f9',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800'
  };

  return { ...baseStyles, backgroundColor: backgroundColors[type] };
};

const dismissButtonStyles: React.CSSProperties = {
  border: 'none',
  backgroundColor: 'transparent',
  color: '#666',
  fontSize: '20px',
  cursor: 'pointer',
  marginLeft: 'auto',
  padding: '0 5px'
};

export enum BannerTypeEnum {
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning'
}

export interface InfoBannerContent {
  bannerType: BannerTypeEnum;
  message: string;
  clipboardContent?: string;
}

export interface InfoBannerProps {
  content: InfoBannerContent;
  hideAction: () => void;
}

const InfoBanner: React.FC<InfoBannerProps> = ({ content: { bannerType, message, clipboardContent }, hideAction }) => {
  if (!message) return null;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(clipboardContent || '');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div id="infoBanner" style={getBannerStyles(bannerType)}>
      <span>
        {message}
        {clipboardContent ? `: ${clipboardContent}` : ''}
      </span>
      {clipboardContent && <button onClick={copyToClipboard}>Copy</button>}
      <button
        onClick={() => {
          hideAction();
        }}
        style={dismissButtonStyles}
      >
        X
      </button>
    </div>
  );
};

export default InfoBanner;
