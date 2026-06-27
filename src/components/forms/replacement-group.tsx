import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useForm } from "@tanstack/react-form";
import { type FC, useEffect } from "react";
import { AppFormHook } from "../../libs/form/hook";
import { QuestionDialog } from "../question-dialog";

export const ReplacementGroup = AppFormHook.withFieldGroup({
  props: {} as {
    onNavNextOccurrence: (key: string) => unknown;
    onNavPrevOccurrence: (key: string) => unknown;
  },
  defaultValues: {} as {
    replacements: Array<{ markerKey: string; replacement: string }>;
  },
  render: ({ group, ...props }) => {
    return (
      <group.Field name="replacements" mode="array">
        {(f) => (
          <Stack spacing={3}>
            {f.state.value.map((_, i) => (
              <group.Field
                name={`replacements[${i}]`}
                // biome-ignore lint/suspicious/noArrayIndexKey: Following pattern from tanstack docs
                key={i}
              >
                {({ state: { value }, handleBlur, handleChange }) => {
                  return (
                    <Stack spacing={1}>
                      <Stack
                        useFlexGap
                        spacing={1}
                        direction={"row"}
                        sx={{
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
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
                            color="primary"
                            onClick={() =>
                              props.onNavNextOccurrence(value.markerKey)
                            }
                          >
                            <KeyboardArrowDownIcon />
                          </IconButton>
                          <IconButton
                            color="primary"
                            onClick={() => {
                              props.onNavPrevOccurrence(value.markerKey);
                            }}
                          >
                            <KeyboardArrowUpIcon />
                          </IconButton>
                        </Stack>
                      </Stack>
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
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <CloseIcon
                                  sx={{ cursor: "pointer" }}
                                  onClick={() => {
                                    handleChange((prev) => ({
                                      ...prev,
                                      replacement: "",
                                    }));
                                  }}
                                />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                      <Box>
                        <QuestionDialog
                          markerKey={value.markerKey}
                          onSelect={(value) => {
                            handleChange((prev) => ({
                              ...prev,
                              replacement: value,
                            }));
                          }}
                        >
                          {({ openDialog }) => (
                            <Button
                              variant="outlined"
                              onClick={openDialog}
                              disableTouchRipple
                            >
                              {`Insert from question bank`}
                            </Button>
                          )}
                        </QuestionDialog>
                      </Box>
                    </Stack>
                  );
                }}
              </group.Field>
            ))}
          </Stack>
        )}
      </group.Field>
    );
  },
});
