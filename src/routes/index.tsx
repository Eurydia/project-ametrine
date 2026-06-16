import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import { basename, documentDir, extname } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { act, useEffect, useMemo, useState } from "react";
import {
  getMarkerKeys,
  getTokens,
  type TokenKind,
} from "../api/tex-builk-edit";
import { TexFilePreview } from "../components/tex-file-preview";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

export type Path = string;

function RouteComponent() {
  const [highlightedMarker, setHighlightedMarker] = useState<null | {
    marker: string;
    order: number;
  }>(null);
  const [fileLookup, setFileLookup] = useState<
    Record<
      Path,
      {
        fileData: { name: string; content: string; path: string };
        tokens: Array<TokenKind>;
        markers: Record<string, number>;
      }
    >
  >({});

  const [currentFilePath, setCurrentFilePath] = useState<
    keyof typeof fileLookup | null
  >(null);

  const activeFile = useMemo(() => {
    if (currentFilePath === null) {
      return null;
    }
    return fileLookup[currentFilePath] ?? null;
  }, [currentFilePath, fileLookup]);

  const form = useForm({
    defaultValues: {
      replacements: [] as Array<{ markerKey: string; replacement: string }>,
    },
  });

  useEffect(() => {
    const keys = new Set(
      Object.values(fileLookup).flatMap((f) => Object.keys(f.markers)),
    );

    form.setFieldValue("replacements", (prev) => {
      const prevLookup = Object.fromEntries(
        prev.map(({ markerKey, replacement }) => [markerKey, replacement]),
      );

      return Array.from(keys).map((markerKey) => ({
        markerKey,
        replacement: prevLookup[markerKey] ?? "",
      }));
    });
  }, [fileLookup, form.setFieldValue]);

  const markerReplacements = useSelector(form.store, ({ values }) => {
    return Object.fromEntries(
      values.replacements.map(({ markerKey, replacement }) => [
        markerKey,
        replacement,
      ]),
    );
  });

  return (
    <Grid container>
      <Grid size={{ lg: 4 }} sx={{ overflow: "auto" }}>
        <Paper variant="elevation" elevation={0} sx={{ padding: 2 }}>
          <Stack spacing={4}>
            <Toolbar
              variant="dense"
              disableGutters
              sx={{ justifyContent: "space-between" }}
            >
              <Button
                variant="contained"
                onClick={async () => {
                  const items = await open({
                    title: "Select TeX documents to open",
                    directory: false,
                    multiple: true,
                    fileAccessMode: "copy",
                    filters: [{ extensions: ["tex"], name: "TeX" }],
                    pickerMode: "document",
                  });

                  if (items === null || items.length === 0) {
                    return;
                  }

                  const next = await Promise.all(
                    items.map(async (filePath) => {
                      const content = await readTextFile(filePath);
                      return [
                        filePath,
                        {
                          fileData: {
                            name: await basename(filePath),
                            content,
                            path: filePath,
                          },
                          tokens: await getTokens(content),
                          markers: await getMarkerKeys(content),
                        },
                      ];
                    }),
                  );

                  setFileLookup((prev) => ({
                    ...prev,
                    ...Object.fromEntries(next),
                  }));
                  setCurrentFilePath(items[0]);
                }}
              >
                OPEN FILES
              </Button>
              <Button
                onClick={async () => {
                  const dir = await open({
                    directory: true,
                    title: "Select directory to save the modified files",
                    multiple: false,
                    recursive: false,
                    defaultPath: await documentDir(),
                  });

                  Promise.all(
                    Object.values(fileLookup).map(async (file) => {
                      writeTextFile(
                        `${dir}/${await basename(file.fileData.name, ".tex")}-modified.${await extname(file.fileData.name)}`,
                        file.tokens
                          .map((tok) => {
                            if (tok.kind === "TexString") {
                              return tok.content;
                            }
                            return (
                              markerReplacements[tok.key] ||
                              `<<<(${tok.key})>>>`
                            );
                          })
                          .join(""),
                      );
                    }),
                  );
                }}
              >
                SAVE FILES
              </Button>
            </Toolbar>
            <form.Field name="replacements" mode="array">
              {(f) => (
                <Stack spacing={2}>
                  {f.state.value.map((_, i) => (
                    <form.Field
                      name={`replacements[${i}]`}
                      key={`replacements[${i}]`}
                    >
                      {({ state: { value }, handleBlur, handleChange }) => {
                        return (
                          <Stack>
                            <Toolbar
                              disableGutters
                              variant="dense"
                              sx={{ justifyContent: "space-between" }}
                            >
                              <Stack direction={"row"} spacing={0.5} useFlexGap>
                                <Typography
                                  sx={{
                                    fontFamily: "monospace",
                                    fontWeight: 700,
                                  }}
                                  color="primary"
                                >
                                  {`<<<(${value.markerKey})>>>`}
                                </Typography>
                                {activeFile !== null && (
                                  <Typography>{`(${activeFile.markers[value.markerKey]} occurences in this file)`}</Typography>
                                )}
                              </Stack>
                              <Stack direction={"row"}>
                                <IconButton
                                  onClick={() => {
                                    setHighlightedMarker((prev) => {
                                      if (
                                        prev !== null &&
                                        prev.marker === value.markerKey &&
                                        activeFile !== null
                                      ) {
                                        return {
                                          marker: value.markerKey,
                                          order:
                                            (prev.order + 1) %
                                            activeFile.markers[value.markerKey],
                                        };
                                      }
                                      return {
                                        marker: value.markerKey,
                                        order: 0,
                                      };
                                    });
                                  }}
                                >
                                  <KeyboardArrowDownIcon />
                                </IconButton>
                                <IconButton
                                  onClick={() => {
                                    setHighlightedMarker((prev) => {
                                      if (
                                        prev !== null &&
                                        prev.marker === value.markerKey &&
                                        activeFile !== null
                                      ) {
                                        return {
                                          marker: value.markerKey,
                                          order:
                                            (prev.order === 0
                                              ? activeFile.markers[
                                                  value.markerKey
                                                ]
                                              : prev.order) - 1,
                                        };
                                      }
                                      return {
                                        marker: value.markerKey,
                                        order: 0,
                                      };
                                    });
                                  }}
                                >
                                  <KeyboardArrowUpIcon />
                                </IconButton>
                              </Stack>
                            </Toolbar>
                            <TextField
                              multiline
                              value={value.replacement}
                              onBlur={handleBlur}
                              onChange={(e) =>
                                handleChange((prev) => ({
                                  ...prev,
                                  replacement: e.target.value,
                                }))
                              }
                              slotProps={{
                                htmlInput: { sx: { fontFamily: "monospace" } },
                              }}
                            />
                          </Stack>
                        );
                      }}
                    </form.Field>
                  ))}
                </Stack>
              )}
            </form.Field>
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ lg: 8 }} sx={{ overflow: "auto", maxHeight: "100dvh" }}>
        {activeFile !== null && (
          <Stack>
            <Toolbar
              sx={{
                justifyContent: "center",
                borderBottom: "1px solid black",
              }}
              disableGutters
              variant="dense"
            >
              <Typography component={"pre"} sx={{ fontFamily: "monospace" }}>
                {activeFile.fileData.name}
              </Typography>
            </Toolbar>
            <TexFilePreview
              highlight={highlightedMarker ?? undefined}
              tokens={activeFile.tokens}
              replacements={markerReplacements}
            />
          </Stack>
        )}
      </Grid>
    </Grid>
  );
}
