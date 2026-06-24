import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { matchSorter } from "match-sorter";
import {
  type FC,
  type ReactNode,
  Suspense,
  use,
  useMemo,
  useState,
} from "react";
import z from "zod/v4";
import {
  createQuestion,
  deleteQuestion,
  listQuestions,
  type Question,
  updateQuestion,
} from "../api/questions";

export const QuestionBankDialog: FC<{
  children: (value: { openDialog: () => unknown }) => ReactNode;
}> = (props) => {
  const items = useQuery({
    queryKey: ["questions"],
    queryFn: listQuestions,
  });

  const [query, setQuery] = useState("");

  const newQuestionForm = useForm({
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
    onSubmit: ({ value, formApi }) => {
      try {
        props.onCreate(value);
      } finally {
        formApi.clearFieldValues("tags");
        formApi.setFieldValue("content", "");
      }
    },
  });

  const editQuestionForm = useForm({
    defaultValues: {
      value: null as {
        id: number;
        content: string;
        tags: Array<string>;
      } | null,
    },
    validators: {
      onChange: z.object({
        value: z
          .object({
            id: z.number(),
            content: z.string().trim().normalize().nonempty(),
            tags: z.string().trim().normalize().nonempty().array().nonempty(),
          })
          .nullable(),
      }),
    },
    onSubmit: ({ value, formApi }) => {
      if (value.value === null) {
        return;
      }
      try {
        props.onUpdate(value.value);
      } finally {
        formApi.setFieldValue("value", null);
      }
    },
  });

  const filtered = useMemo(() => {
    const tokens = query
      .split(" ")
      .map((t) => t.trim().normalize())
      .filter((t) => t.length > 0);

    if (tokens.length === 0) {
      return items;
    }

    return tokens.reduce(
      (results, term) =>
        matchSorter(results, term, { keys: [(k) => k.content] }),
      items,
    );
  }, [query, items]);

  const handleDelete = async (id: number) => {
    setBusy(true);

    try {
      await deleteQuestion(id);

      if (editingId === id) {
        setEditingId(null);
        setEditingContent("");
      }

      props.onRefresh();
    } finally {
      setBusy(false);
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false);

  const openDialog = () => {
    setDialogOpen(true);
  };

  return (
    <>
      {props.children({ openDialog })}

      {dialogOpen && (
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogContent>
            <Stack spacing={4} divider={<Divider flexItem />}>
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
                  <Button
                    variant="contained"
                    disabled={busy || newContent.trim().length === 0}
                    onClick={() => void handleCreate()}
                  >
                    add
                  </Button>
                </Stack>

                <TextField
                  multiline
                  minRows={3}
                  placeholder="Question content"
                  value={newContent}
                  onChange={(e) => {
                    setNewContent(e.target.value);
                  }}
                  slotProps={{
                    htmlInput: { sx: { fontFamily: "monospace" } },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <CloseIcon
                            sx={{ cursor: "pointer" }}
                            onClick={() => {
                              setNewContent("");
                            }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Stack>

              <Stack spacing={2}>
                <Typography sx={{ fontWeight: 700 }} variant="button">
                  Existing question in question bank
                </Typography>
                <TextField
                  placeholder="Type to search for questions"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <CloseIcon
                            sx={{ cursor: "pointer" }}
                            onClick={() => {
                              setQuery("");
                            }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Typography>{`Found ${filtered.length} question(s)`}</Typography>
                <Stack spacing={2}>
                  {filtered.length === 0 && (
                    <Typography sx={{ fontStyle: "italic" }} variant="button">
                      No question in question bank
                    </Typography>
                  )}

                  {filtered.map(({ content, id }) => {
                    const isEditing = editingId === id;

                    return (
                      <Card key={id} variant="outlined">
                        <CardContent>
                          <Stack spacing={2}>
                            <Stack
                              direction={"row"}
                              spacing={1}
                              useFlexGap
                              sx={{ justifyContent: "space-between" }}
                            >
                              {isEditing ? (
                                <>
                                  <Button
                                    variant="outlined"
                                    disabled={
                                      busy || editingContent.trim().length === 0
                                    }
                                    onClick={() => void handleUpdate(id)}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    disabled={busy}
                                    onClick={() => {
                                      setEditingId(null);
                                      setEditingContent("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="outlined"
                                    disabled={busy}
                                    onClick={() => {
                                      setEditingId(id);
                                      setEditingContent(content);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    disabled={busy}
                                    onClick={() => void handleDelete(id)}
                                  >
                                    Remove
                                  </Button>
                                </>
                              )}
                            </Stack>

                            {isEditing ? (
                              <TextField
                                multiline
                                minRows={3}
                                value={editingContent}
                                onChange={(e) => {
                                  setEditingContent(e.target.value);
                                }}
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
                                            setNewContent("");
                                          }}
                                        />
                                      </InputAdornment>
                                    ),
                                  },
                                }}
                              />
                            ) : (
                              <Typography sx={{ fontFamily: "monospace" }}>
                                {content}
                              </Typography>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </Stack>
            </Stack>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
