import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { matchSorter, rankings } from "match-sorter";
import {
  type FC,
  type ReactNode,
  Suspense,
  use,
  useCallback,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";
import {
  createQuestion,
  deleteQuestion,
  listQuestions,
  type Question,
  updateQuestion,
} from "../api/questions";
import { CreateQuestionForm } from "./forms/create-question";
import { EditQuestion } from "./forms/edit-question";

const QuestionBankForm: FC<{
  questionPromise: Promise<Array<Question>>;
  onUpdate: () => unknown;
}> = (props) => {
  const questions = use(props.questionPromise);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleDelete = useCallback(
    async (id: number) =>
      deleteQuestion(id).then(() => {
        toast.warn("Question removed");
        props.onUpdate();
      }),
    [props.onUpdate],
  );

  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const tokens = query
      .split(" ")
      .map((t) => t.trim().normalize())
      .filter((t) => t.length > 0);

    if (tokens.length === 0) {
      return questions;
    }

    return tokens.reduce(
      (results, term) =>
        matchSorter(results, term, {
          keys: [(k) => k.content, (k) => k.tags],
          threshold: rankings.CONTAINS,
        }),
      questions,
    );
  }, [query, questions]);

  const tagOptions = useMemo(() => {
    const tags = new Set<string>();
    for (const question of questions)
      question.tags.forEach((tag) => {
        tags.add(tag);
      });
    return Array.from(tags).toSorted((a, b) => a.localeCompare(b));
  }, [questions]);

  return (
    <Stack spacing={4} divider={<Divider flexItem />}>
      <CreateQuestionForm
        tagOptions={tagOptions}
        onSubmit={(values) => {
          createQuestion(values).then(() => {
            toast.success("Question added");
            props.onUpdate();
          });
        }}
      />
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

          {filtered.map(({ tags, content, id }) => {
            const isEditing = editingId === id;

            return (
              <Card key={id} variant="outlined">
                <CardContent>
                  {isEditing ? (
                    <EditQuestion
                      value={{
                        tags,
                        content,
                      }}
                      tagsOptions={tagOptions}
                      onSubmit={(values) => {
                        updateQuestion({ id, ...values }).then(() => {
                          toast.success("Changes saved");
                          setEditingId(null);
                          props.onUpdate();
                        });
                      }}
                      onCancel={() => {
                        setEditingId(null);
                      }}
                    />
                  ) : (
                    <Stack spacing={2}>
                      <Stack
                        direction={"row"}
                        spacing={1}
                        useFlexGap
                        sx={{ justifyContent: "space-between" }}
                      >
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEditingId(id);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(id)}
                        >
                          Remove
                        </Button>
                      </Stack>
                      <Typography sx={{ fontFamily: "monospace" }}>
                        {content}
                      </Typography>
                      {tags.length > 0 && (
                        <Stack
                          useFlexGap
                          spacing={1}
                          direction={"row"}
                          sx={{ flexWrap: "wrap" }}
                        >
                          {tags.map((tag) => (
                            <Chip
                              variant="outlined"
                              color="primary"
                              label={tag}
                              key={tag}
                            />
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};

export const QuestionBankDialog: FC<{
  children: (value: { openDialog: () => unknown }) => ReactNode;
}> = (props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dataPromise, setDataPromise] = useState(() => listQuestions());

  return (
    <>
      {props.children({ openDialog: () => setDialogOpen(true) })}
      {dialogOpen && (
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogContent>
            <Suspense fallback={<CircularProgress />}>
              <QuestionBankForm
                questionPromise={dataPromise}
                onUpdate={() => {
                  setDataPromise(listQuestions);
                }}
              />
            </Suspense>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
