import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Fab from "@mui/material/Fab";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { createFileRoute } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { ReplacementGroup } from "../components/forms/replacement-group";
import { QuestionBankDialog } from "../components/question-bank-dialog";
import { TexFilePreview } from "../components/tex-file-preview";
import { useFileManager } from "../hooks/use-file-manager";
import { usePreviewFontSize } from "../hooks/use-font-size-control";
import { useHighlightManager } from "../hooks/use-highlight-manager";
import { AppFormHook } from "../libs/form/hook";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    saveFilesWithReplacements,
    closeFile,
    addFileFromPaths,
    fileArray,
    activeFile,
    changeActiveFile,
  } = useFileManager();

  const { highlightedMarker, navigateNextHighlight, navigatePrevHighlight } =
    useHighlightManager();

  const form = AppFormHook.useAppForm({
    defaultValues: {
      replacements: [] as Array<{ markerKey: string; replacement: string }>,
    },
  });

  const previewFontSize = usePreviewFontSize(16);

  useEffect(() => {
    form.setFieldValue("replacements", (prev) => {
      const nextMarkers = Array.from(
        new Set(fileArray.flatMap(({ markers }) => Object.keys(markers))),
      ).toSorted((a, b) => a.localeCompare(b));
      const prevLookup = Object.fromEntries(
        prev.map(({ markerKey, replacement }) => [markerKey, replacement]),
      );
      return nextMarkers.map((markerKey) => ({
        markerKey,
        replacement: prevLookup[markerKey] ?? "",
      }));
    });
  }, [fileArray, form]);

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
      <Grid size={4}>
        <Paper
          variant="elevation"
          elevation={0}
          sx={{
            padding: 2,
            height: "100vh",
            overflow: "auto",
            scrollbarColor: (t) =>
              `${t.darken(t.palette.background.paper, 0.42)} ${t.palette.background.paper}`,
          }}
        >
          <Stack spacing={4}>
            <Stack
              direction={"row"}
              spacing={1}
              useFlexGap
              sx={{ justifyContent: "space-between", flexWrap: "wrap" }}
            >
              <Stack
                useFlexGap
                spacing={1}
                direction={"row"}
                sx={{ flexWrap: "wrap" }}
              >
                <Button
                  disableTouchRipple
                  variant="contained"
                  onClick={() => {
                    addFileFromPaths({
                      onNoPathSelected: () =>
                        toast.warn("No file was selected."),
                      onMarkerlessFileIgnored: () =>
                        toast.warn(
                          "One or more files were not opened because they did not contain a placeholder marker.",
                        ),
                    });
                  }}
                >
                  {`OPEN FILES`}
                </Button>
                <Button
                  disabled={fileArray.length === 0}
                  disableTouchRipple
                  variant="outlined"
                  onClick={() => saveFilesWithReplacements(markerReplacements)}
                >
                  {`SAVE FILES`}
                </Button>
              </Stack>
              <QuestionBankDialog>
                {({ openDialog }) => (
                  <Button variant="outlined" onClick={openDialog}>
                    {`OPEN QUESTION BANK`}
                  </Button>
                )}
              </QuestionBankDialog>
            </Stack>
            {fileArray.length === 0 && (
              <Typography color="textSecondary">
                {`Add a file with at least one marker `}
                <Typography
                  component={"code"}
                  color="primary"
                  sx={{
                    display: "inline",
                    fontFamily: "monospace",
                    fontWeight: 700,
                  }}
                >
                  {`<<<(...)>>>`}
                </Typography>
                {` to start working`}
              </Typography>
            )}
            <ReplacementGroup
              onNavNextOccurrence={(marker) =>
                navigateNextHighlight(marker, activeFile)
              }
              onNavPrevOccurrence={(marker) =>
                navigatePrevHighlight(marker, activeFile)
              }
              form={form}
              fields={{ replacements: "replacements" }}
            />
          </Stack>
        </Paper>
      </Grid>
      <Grid
        size={8}
        sx={{
          overflow: "auto",
          maxHeight: "100dvh",
          scrollbarColor: (t) =>
            `${t.darken(t.palette.background.default, 0.42)} ${t.palette.background.default}`,
        }}
      >
        <Tabs
          value={activeFile?.fileData.path ?? ""}
          onChange={(_, v) => changeActiveFile(v)}
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
          {fileArray.map((file) => {
            const selected = activeFile?.fileData.path === file.fileData.path;
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
                  textTransform: "none",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  borderBottomColor: (t) =>
                    selected ? t.palette.primary.main : "transparent",
                  color: (t) =>
                    selected ? t.palette.primary.main : t.palette.text.primary,
                }}
                icon={
                  <CloseIcon
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      closeFile(file.fileData.path);
                    }}
                  />
                }
                iconPosition="end"
              />
            );
          })}
        </Tabs>
        <Box sx={{ padding: 2 }}>
          <Box
            sx={{
              position: "fixed",
              right: 24,
              bottom: 24,
              zIndex: (theme) => theme.zIndex.tooltip,
            }}
          >
            <Stack spacing={1} sx={{ alignItems: "center" }}>
              <Typography
                component={"span"}
                onClick={previewFontSize.resetFontSize}
                sx={{
                  cursor: "pointer",
                  userSelect: "none",
                  ":hover": {
                    textDecorationLine: "underline",
                  },
                }}
              >
                {`${previewFontSize.zoomPercent}%`}
              </Typography>
              <Fab
                disableTouchRipple
                color="primary"
                size="small"
                variant="extended"
                onClick={previewFontSize.increaseFontSize}
              >
                <AddIcon />
              </Fab>
              <Fab
                disableTouchRipple
                variant="extended"
                color="primary"
                size="small"
                onClick={previewFontSize.decreaseFontSize}
              >
                <RemoveIcon />
              </Fab>
            </Stack>
          </Box>
          {activeFile !== null && (
            <TexFilePreview
              fontSize={previewFontSize.fontSize}
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
