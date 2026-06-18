import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import { basename, documentDir, extname } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
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
        fileData: { name: string; path: string };
        tokens: Array<TokenKind>;
        markers: Record<string, number | undefined>;
      }
    >
  >({});

  const [currentFilePath, setCurrentFilePath] = useState<
    keyof typeof fileLookup | ""
  >("");

  const activeFile = useMemo(() => {
    if (currentFilePath === "") {
      return null;
    }
    return fileLookup[currentFilePath] ?? null;
  }, [currentFilePath, fileLookup]);

  const fileArrays = useMemo(() => {
    return Array.from(Object.values(fileLookup));
  }, [fileLookup]);

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
      <Grid size={{ lg: 4 }}>
        <Paper
          variant="elevation"
          elevation={0}
          sx={{ padding: 2, height: "100vh", overflow: "auto" }}
        >
          <Stack spacing={4}>
            <Toolbar
              variant="dense"
              disableGutters
              sx={{ justifyContent: "space-between" }}
            >
              <Button
                disableTouchRipple
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

                  const next = (
                    await Promise.all(
                      items.map(async (filePath) => {
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

                  if (next.length < items.length) {
                    toast.warning(
                      "One or more files were not opened because they did not contain a placeholder.",
                    );
                  }

                  const firstFile = next.at(0);
                  if (firstFile !== undefined) {
                    setFileLookup((prev) => ({
                      ...prev,
                      ...Object.fromEntries(next),
                    }));
                    setCurrentFilePath(firstFile[0]);
                  }
                }}
              >
                OPEN FILES
              </Button>
              <Button
                disabled={fileArrays.length === 0}
                disableTouchRipple
                variant="outlined"
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
                              <Typography
                                sx={{
                                  fontFamily: "monospace",
                                  fontWeight: 700,
                                }}
                                color="primary"
                              >
                                {`<<<(${value.markerKey})>>>`}
                              </Typography>
                              <Stack direction={"row"}>
                                <IconButton
                                  onClick={() => {
                                    if (activeFile === null) {
                                      return;
                                    }

                                    const occurenceCount =
                                      activeFile.markers[value.markerKey];

                                    if (occurenceCount === undefined) {
                                      return;
                                    }

                                    setHighlightedMarker((prev) => {
                                      if (
                                        prev !== null &&
                                        prev.marker === value.markerKey
                                      ) {
                                        return {
                                          marker: value.markerKey,
                                          order:
                                            (prev.order + 1) % occurenceCount,
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
                                    if (activeFile === null) {
                                      return;
                                    }
                                    const occurenceCount =
                                      activeFile.markers[value.markerKey];

                                    if (occurenceCount === undefined) {
                                      return;
                                    }

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
                                              ? occurenceCount
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
        <Tabs
          value={currentFilePath}
          onChange={(_, v) => setCurrentFilePath(v)}
          sx={{
            overflow: "visible",
          }}
          slotProps={{
            scroller: {
              sx: {
                overflow: "visible",
                whiteSpace: "normal",
              },
            },
            list: {
              sx: {
                flexWrap: "wrap",
                alignItems: "flex-start",
              },
            },
            indicator: {
              sx: {
                display: "none",
              },
            },
          }}
        >
          {fileArrays.map((file) => {
            const selected = currentFilePath === file.fileData.path;
            return (
              <Tab
                disableTouchRipple
                key={file.fileData.path}
                label={file.fileData.name}
                value={file.fileData.path}
                sx={{
                  whiteSpace: "nowrap",
                  maxWidth: "none",
                  minWidth: "auto",
                  flexShrink: 0,
                  borderBottom: "2px solid",
                  borderBottomColor: (t) =>
                    selected ? t.palette.primary.main : "transparent",
                  color: (t) =>
                    selected ? t.palette.primary.main : t.palette.text.primary,
                }}
                icon={
                  <CloseIcon
                    component={"span"}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFileLookup((prev) => {
                        const { [file.fileData.path]: _, ...next } = prev;
                        return next;
                      });
                    }}
                  />
                }
                iconPosition="end"
              />
            );
          })}
        </Tabs>
        <Box sx={}>
          {activeFile !== null && (
            <TexFilePreview
              highlight={highlightedMarker ?? undefined}
              tokens={activeFile.tokens}
              replacements={markerReplacements}
            />
          )}
        </Box>
      </Grid>
    </Grid>
  );
}
