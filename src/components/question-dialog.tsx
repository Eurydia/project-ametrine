import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
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
  useMemo,
  useState,
} from "react";
import { listQuestions, type Question } from "../api/questions";

const DialogBody: FC<{
  onSelect: (value: string) => unknown;
  promise: Promise<Array<Question>>;
}> = (props) => {
  const questions = use(props.promise);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const tokens = query
      .split("")
      .map((t) => t.trim().normalize())
      .filter((t) => t.length > 0);

    if (tokens.length === 0) {
      return questions;
    }

    return tokens.reduceRight(
      (results, term) =>
        matchSorter(results, term, {
          keys: [(k) => k.content, (k) => k.tags],
          threshold: rankings.CONTAINS,
        }),
      questions,
    );
  }, [query, questions]);

  return (
    <Stack spacing={2}>
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
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
          <Typography>{`No question found in question bank`}</Typography>
        )}

        {filtered.map(({ tags, content, id }) => {
          return (
            <Card key={id} variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction={"row"} spacing={1} useFlexGap>
                    <Button
                      variant="contained"
                      onClick={() => {
                        props.onSelect(content);
                      }}
                    >
                      Insert
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
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
};

export const QuestionDialog: FC<{
  children: (value: { openDialog: () => unknown }) => ReactNode;
  onSelect: (value: string) => unknown;
  markerKey: string;
}> = (props) => {
  const [dialogOpen, setDialogOpen] = useState(false);

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
          <DialogTitle>
            {`Select a question to insert into `}
            <Typography
              sx={{
                display: "inline",
                fontFamily: "monospace",
                fontWeight: 700,
              }}
              color="primary"
            >
              {`<<<(${props.markerKey})>>>`}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Suspense fallback={<CircularProgress />}>
              <DialogBody
                onSelect={(value) => {
                  props.onSelect(value);
                  setDialogOpen(false);
                }}
                promise={listQuestions()}
              />
            </Suspense>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
