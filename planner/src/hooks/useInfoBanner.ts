import { useState } from 'react';

import { BannerTypeEnum, InfoBannerContent } from '@/src/components/ui/InfoBanner';

export const useInfoBanner = () => {
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [bannerContent, setBannerContent] = useState<InfoBannerContent>({
    bannerType: BannerTypeEnum.INFO,
    message: '',
    clipboardContent: ''
  });

  const openBanner = (content: InfoBannerContent) => {
    setBannerContent(content);
    setIsBannerOpen(true);
  };

  const closeBanner = () => {
    setIsBannerOpen(false);
  };

  return { bannerContent, isBannerOpen, openBanner, closeBanner };
};
