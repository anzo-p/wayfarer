import { FC } from 'react';

export interface OverlayToolbarProps {
  canBeCleared: boolean;
  onClearButtonClick: () => void;
  canBeSaved: boolean;
  isSaving?: boolean;
  onShareButtonClick: () => void;
  canBeShared: boolean;
  isSharing?: boolean;
  onSaveButtonClick: () => void;
}

const ActionToolbar: FC<OverlayToolbarProps> = ({
  canBeCleared,
  onClearButtonClick,
  canBeSaved,
  isSaving = false,
  onSaveButtonClick,
  canBeShared,
  isSharing = false,
  onShareButtonClick
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
        {isSaving ? 'saving...' : 'save'}
      </button>
      <button
        disabled={!canBeShared}
        onClick={() => {
          onShareButtonClick();
        }}
      >
        {isSharing ? 'sharing...' : 'share'}
      </button>
    </div>
  );
};

export default ActionToolbar;
