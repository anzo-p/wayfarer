import React from 'react';

const bannerStyles: React.CSSProperties = {
  width: '99%',
  height: '50px',
  position: 'fixed',
  top: 0,
  left: 0,
  backgroundColor: '#74b4f9',
  color: '#333',
  padding: '10px',
  boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: 100
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

export interface InfoBannerContent {
  message: string;
  clipboardContent?: string;
}

export interface InfoBannerProps {
  content: InfoBannerContent;
  hideAction: () => void;
}

const InfoBanner: React.FC<InfoBannerProps> = ({ content: { message, clipboardContent }, hideAction }) => {
  if (!message) return null;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(clipboardContent || '');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div id="infoBanner" style={bannerStyles}>
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
