import CloseIcon from "@mui/icons-material/Close";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useForm } from "@tanstack/react-form";
import { type FC, useState } from "react";
import z from "zod/v4";

export const EditQuestion: FC<{
  value: { tags: Array<string>; content: string };
  tagsOptions: Array<string>;
  onSubmit: (value: { content: string; tags: Array<string> }) => unknown;
  onCancel: () => unknown;
}> = (props) => {
  const [tagInputValue, setTagInputValue] = useState("");
  const form = useForm({
    defaultValues: {
      ...props.value,
    },
    validators: {
      onChange: z.object({
        content: z.string().trim().normalize().nonempty(),
        tags: z.string().trim().normalize().nonempty().array(),
      }),
    },
    onSubmit: async ({ value }) => {
      return props.onSubmit(value);
    },
  });

  return (
    <Stack spacing={2}>
      <form.Subscribe
        selector={({ canSubmit, isValid, isSubmitting }) => {
          return { allowSubmit: canSubmit && isValid, isSubmitting };
        }}
      >
        {({ allowSubmit, isSubmitting }) => (
          <Stack direction={"row"} spacing={1} useFlexGap>
            <Button
              variant="contained"
              disabled={!allowSubmit || isSubmitting}
              onClick={form.handleSubmit}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              disabled={isSubmitting}
              onClick={props.onCancel}
            >
              Cancel
            </Button>
          </Stack>
        )}
      </form.Subscribe>
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
              htmlInput: { sx: { fontFamily: "monospace" } },
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
            options={props.tagsOptions}
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
