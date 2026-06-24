import CloseIcon from "@mui/icons-material/CloseRounded";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { FC } from "react";
import { toast } from "react-toastify";
import z from "zod/v4";
import { createQuestion } from "../../api/questions";

export const CreateQuestionForm: FC = () => {
  const tagQuery = useQuery({
    queryKey: ["tags", "get"],
    queryFn: async () => {
      invoke<{}>;
    },
  });

  const form = useForm({
    defaultValues: {
      content: "",
      tags: [] as Array<string>,
    },
    validators: {
      onChange: z.object({
        content: z.string().trim().normalize().nonempty(),
        tags: z.string().trim().normalize().nonempty().array().nonempty(),
      }),
    },
    onSubmit: ({ value }) => {
      mutation.mutateAsync(value);
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: { content: string; tags: Array<string> }) => {
      createQuestion(values);
    },
    mutationKey: ["questions", "create"],
    onSuccess: () => {
      form.setFieldValue("content", "");
      form.clearFieldValues("tags");
      toast.success("Question added");
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
          selector={({ values }) => {
            return values.content;
          }}
        >
          {(content) => (
            <Button
              variant="contained"
              disabled={mutation.isPending || content.trim().length === 0}
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
            disabled={mutation.isPending}
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
            disabled={mutation.isPending}
            multiline
            multiple
            freeSolo
            minRows={2}
            placeholder="Type a tag then ENTER to add it"
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
    </Stack>
  );
};
