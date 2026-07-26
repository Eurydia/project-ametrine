import CloseIcon from "@mui/icons-material/CloseRounded";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useForm } from "@tanstack/react-form";
import { type FC, useState } from "react";
import z from "zod/v4";

export const CreateQuestionForm: FC<{
  tagOptions: Array<string>;
  onSubmit: (values: { content: string; tags: Array<string> }) => unknown;
}> = (props) => {
  const [tagInputValue, setTagInputValue] = useState("");
  const form = useForm({
    defaultValues: {
      content: "",
      tags: [] as Array<string>,
    },
    validators: {
      onChange: z.object({
        content: z.string().trim().normalize().nonempty(),
        tags: z.string().trim().normalize().nonempty().array(),
      }),
    },
    onSubmit: ({ value, formApi }) => {
      formApi.setFieldValue("content", "");
      formApi.clearFieldValues("tags");
      setTagInputValue("");
      props.onSubmit(value);
    },
  });

  return (
    <Stack spacing={2}>
      <Stack
        spacing={1}
        useFlexGap
        direction={"row"}
        sx={{
          flexWrap: "wrap",
          alignContent: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="button" sx={{ fontWeight: 700 }}>
          Add question to question bank
        </Typography>
        <form.Subscribe
          selector={({ canSubmit, isValid, isSubmitting }) => {
            return { canSubmit, isValid, isSubmitting };
          }}
        >
          {({ canSubmit, isSubmitting, isValid }) => (
            <Button
              variant="contained"
              disabled={!canSubmit || isSubmitting || !isValid}
              onClick={form.handleSubmit}
            >
              add
            </Button>
          )}
        </form.Subscribe>
      </Stack>

      <form.Field name="content">
        {({ state: { value }, handleBlur, handleChange }) => (
          <TextField
            multiline
            minRows={3}
            placeholder="Question content"
            value={value}
            onChange={(e) => {
              handleChange(e.target.value);
            }}
            onBlur={handleBlur}
            slotProps={{
              htmlInput: {
                sx: { fontFamily: "monospace" },
              },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <CloseIcon
                      sx={{ cursor: "pointer" }}
                      onClick={() => {
                        handleChange("");
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      </form.Field>
      <form.Field name="tags">
        {({ state: { value }, handleBlur, handleChange }) => (
          <Autocomplete
            multiple
            freeSolo
            fullWidth
            inputValue={tagInputValue}
            onInputChange={(_, v) => setTagInputValue(v)}
            options={props.tagOptions}
            value={value}
            onChange={(_, values) => {
              handleChange(values);
            }}
            onBlur={handleBlur}
            renderInput={(inputProps) => (
              <TextField
                {...inputProps}
                placeholder="Type a tag then ENTER to add it"
              />
            )}
          />
        )}
      </form.Field>
    </Stack>
  );
};
