import { basename, documentDir, extname } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { useCallback, useMemo, useState } from "react";
import {
  getMarkerKeys,
  getTokens,
  type TokenKind,
} from "../api/tex-builk-edit";

export const useFileManager = () => {
  const [managerState, setManagerState] = useState<{
    activeFilePath: string | null;
    lookupTable: Record<
      string,
      {
        fileData: { name: string; path: string };
        tokens: Array<TokenKind>;
        markers: Record<string, number | undefined>;
      }
    >;
  }>({ activeFilePath: null, lookupTable: {} });

  const activeFile = useMemo(() => {
    if (managerState.activeFilePath === null) {
      return null;
    }
    return managerState.lookupTable[managerState.activeFilePath] ?? null;
  }, [managerState]);

  const fileArray = useMemo(() => {
    return Array.from(Object.values(managerState.lookupTable));
  }, [managerState]);

  const addFileFromPaths = useCallback(
    async (options: {
      onMarkerlessFileIgnored: () => unknown;
      onNoPathSelected: () => unknown;
    }) => {
      const paths = await open({
        title: "Select TeX documents to open",
        directory: false,
        multiple: true,
        fileAccessMode: "copy",
        filters: [{ extensions: ["tex"], name: "TeX" }],
        pickerMode: "document",
      });

      if (paths === null || paths.length === 0) {
        options.onNoPathSelected();
        return;
      }

      const next = (
        await Promise.all(
          paths.map(async (filePath) => {
            const content = await readTextFile(filePath);
            return [
              filePath,
              {
                fileData: {
                  name: await basename(filePath),
                  path: filePath,
                },
                tokens: await getTokens(content),
                markers: await getMarkerKeys(content),
              },
            ] as const;
          }),
        )
      ).filter(([_, file]) => {
        return Object.values(file.markers).some((val) => val > 0);
      });

      if (next.length < paths.length) {
        options.onMarkerlessFileIgnored();
        return;
      }

      const firstFile = next.at(0);
      if (firstFile !== undefined) {
        setManagerState((prev) => {
          const nextLookupTable = {
            ...prev.lookupTable,
            ...Object.fromEntries(next),
          };
          const [
            _,
            {
              fileData: { path: nextActiveFilePath },
            },
          ] = firstFile;
          return {
            lookupTable: nextLookupTable,
            activeFilePath: nextActiveFilePath,
          };
        });
      }
    },
    [],
  );

  const closeFile = useCallback((path: string) => {
    setManagerState((prev) => {
      const nextTable = Object.entries(prev.lookupTable).filter(
        ([filePath]) => filePath !== path,
      );
      const nextActiveFilePath = nextTable.at(0)?.[0] ?? null;
      return {
        activeFilePath: nextActiveFilePath,
        lookupTable: Object.fromEntries(nextTable),
      };
    });
  }, []);

  const changeActiveFile = useCallback((path: string) => {
    setManagerState((prev) => {
      if (path in prev.lookupTable) {
        return { ...prev, activeFilePath: path };
      }
      return prev;
    });
  }, []);

  const saveFilesWithReplacements = useCallback(
    async (replacements: Record<string, string | undefined>) => {
      const dir = await open({
        directory: true,
        title: "Select directory to save the modified files",
        multiple: false,
        recursive: false,
        defaultPath: await documentDir(),
      });

      await Promise.all(
        Object.values(managerState.lookupTable).map(async (file) => {
          writeTextFile(
            `${dir}/${await basename(file.fileData.name, ".tex")}-modified.${await extname(file.fileData.name)}`,
            file.tokens
              .map((tok) => {
                if (tok.kind === "TexString") {
                  return tok.content;
                }
                return replacements[tok.key] || `<<<(${tok.key})>>>`;
              })
              .join(""),
          );
        }),
      );
    },
    [managerState],
  );

  return {
    addFileFromPaths,
    fileArray,
    activeFile,
    closeFile,
    changeActiveFile,
    saveFilesWithReplacements,
  };
};
