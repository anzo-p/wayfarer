import React from 'react';

export interface OverlayToolbarProps {
  canBeCleared: boolean;
  onClearButtonClick: () => void;
  canBeSaved: boolean;
  onSharedButtonClick: () => void;
  canBeShared: boolean;
  onSaveButtonClick: () => void;
}

export const OverlayToolbar: React.FC<OverlayToolbarProps> = ({
  canBeCleared,
  onClearButtonClick,
  canBeSaved,
  onSaveButtonClick,
  canBeShared,
  onSharedButtonClick
}) => {
  return (
    <div>
      <button
        disabled={!canBeCleared}
        onClick={() => {
          onClearButtonClick();
        }}
      >
        clear
      </button>
      <button
        disabled={!canBeSaved}
        onClick={() => {
          onSaveButtonClick();
        }}
      >
        save
      </button>
      <button
        disabled={!canBeShared}
        onClick={() => {
          onSharedButtonClick();
        }}
      >
        share
      </button>
    </div>
  );
};
