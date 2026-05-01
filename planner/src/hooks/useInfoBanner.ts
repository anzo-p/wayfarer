import { useCallback, useState } from 'react';

import type { InfoBannerContent } from '@/src/components/ui/InfoBanner';
import { BannerTypeEnum } from '@/src/components/ui/InfoBanner';

interface UseInfoBannerReturn {
  openBanner: (content: InfoBannerContent) => void;
  isBannerOpen: boolean;
  bannerContent: InfoBannerContent;
  closeBanner: () => void;
}

const defaultBannerContent: InfoBannerContent = {
  bannerType: BannerTypeEnum.INFO,
  message: '',
  clipboardContent: ''
};

export function useInfoBanner(initialContent?: InfoBannerContent): UseInfoBannerReturn {
  const [isBannerOpen, setIsBannerOpen] = useState(Boolean(initialContent));
  const [bannerContent, setBannerContent] = useState<InfoBannerContent>(initialContent ?? defaultBannerContent);

  const openBanner = useCallback((content: InfoBannerContent) => {
    setBannerContent(content);
    setIsBannerOpen(true);
  }, []);

  const closeBanner = useCallback(() => {
    setIsBannerOpen(false);
  }, []);

  return { openBanner, isBannerOpen, bannerContent, closeBanner };
}
