import { useCallback, useMemo, useState } from "react";

const MIN_PREVIEW_FONT_SIZE = 1;
const DEFAULT_PREVIEW_FONT_SIZE = 12;

const getPreviewFontSizeStep = (size: number) => {
  if (size < 12) return 1;
  if (size < 28) return 2;
  if (size < 36) return 4;
  if (size < 72) return 12;
  return 24;
};

const increasePreviewTextSize = (currentSize: number) => {
  const size = Math.max(MIN_PREVIEW_FONT_SIZE, currentSize);
  const step = getPreviewFontSizeStep(size);

  return size + step;
};

const decreasePreviewTextSize = (currentSize: number) => {
  const size = Math.max(MIN_PREVIEW_FONT_SIZE, currentSize);
  const step = getPreviewFontSizeStep(size - 1);

  return Math.max(MIN_PREVIEW_FONT_SIZE, size - step);
};

export const usePreviewFontSize = (initialSize = DEFAULT_PREVIEW_FONT_SIZE) => {
  const [fontSize, setFontSize] = useState(initialSize);

  const increaseFontSize = useCallback(() => {
    setFontSize((currentSize) => increasePreviewTextSize(currentSize));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSize((currentSize) => decreasePreviewTextSize(currentSize));
  }, []);

  const resetFontSize = useCallback(() => {
    setFontSize(initialSize);
  }, [initialSize]);

  const zoomPercent = useMemo(() => {
    return Math.round((fontSize / initialSize) * 100);
  }, [fontSize, initialSize]);

  return {
    zoomPercent,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
  };
};
