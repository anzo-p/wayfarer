import { useState } from 'react';

import { InfoBannerContent } from '@/src/components/ui/InfoBanner';

export const useInfoBanner = () => {
  const [isBannerVisible, setShowBanner] = useState(false);
  const [bannerContent, setBannerContent] = useState<InfoBannerContent>({ message: '', clipboardContent: '' });

  const showBanner = (content: InfoBannerContent) => {
    setBannerContent(content);
    setShowBanner(true);
  };

  const hideBanner = () => {
    setShowBanner(false);
  };

  return { bannerContent, isBannerVisible, showBanner, hideBanner };
};
