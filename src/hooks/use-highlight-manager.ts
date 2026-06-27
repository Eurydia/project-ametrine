import { useCallback, useState } from "react";

export const useHighlightManager = () => {
  const [highlightedMarker, setHighlightedMarker] = useState<null | {
    marker: string;
    order: number;
  }>(null);

  const navigateNextHighlight = useCallback(
    (
      marker: string,
      fileData: { markers: Record<string, number | undefined> } | null,
    ) => {
      if (fileData === null) {
        return;
      }
      const occurenceCount = fileData.markers[marker];
      if (occurenceCount === undefined) {
        return;
      }

      setHighlightedMarker((prev) => {
        if (prev !== null && prev.marker === marker) {
          return {
            marker,
            order: (prev.order + 1) % occurenceCount,
          };
        }
        return {
          marker,
          order: 0,
        };
      });
    },
    [],
  );

  const navigatePrevHighlight = useCallback(
    (
      marker: string,
      fileData: { markers: Record<string, number | undefined> } | null,
    ) => {
      if (fileData === null) {
        return;
      }
      const occurenceCount = fileData.markers[marker];
      if (occurenceCount === undefined) {
        return;
      }

      setHighlightedMarker((prev) => {
        if (prev !== null && prev.marker === marker && fileData !== null) {
          return {
            marker,
            order: (prev.order === 0 ? occurenceCount : prev.order) - 1,
          };
        }
        return {
          marker,
          order: 0,
        };
      });
    },
    [],
  );
  return { highlightedMarker, navigateNextHighlight, navigatePrevHighlight };
};
