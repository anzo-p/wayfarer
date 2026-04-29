import { useCallback, useState } from 'react';

import type { InfoBannerContent } from '@/src/components/ui/InfoBanner';
import { BannerTypeEnum } from '@/src/components/ui/InfoBanner';

interface UseInfoBannerReturn {
  openBanner: (content: InfoBannerContent) => void;
  isBannerOpen: boolean;
  bannerContent: InfoBannerContent;
  closeBanner: () => void;
}

export function useInfoBanner(): UseInfoBannerReturn {
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [bannerContent, setBannerContent] = useState<InfoBannerContent>({
    bannerType: BannerTypeEnum.INFO,
    message: '',
    clipboardContent: ''
  });

  const openBanner = useCallback((content: InfoBannerContent) => {
    setBannerContent(content);
    setIsBannerOpen(true);
  }, []);

  const closeBanner = useCallback(() => {
    setIsBannerOpen(false);
  }, []);

  return { openBanner, isBannerOpen, bannerContent, closeBanner };
}
