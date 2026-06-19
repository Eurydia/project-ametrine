import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { matchSorter } from "match-sorter";
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
  const items = use(props.promise);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const tokens = query
      .split("")
      .map((t) => t.trim().normalize())
      .filter((t) => t.length > 0);

    if (tokens.length === 0) {
      return items;
    }

    return tokens.reduceRight(
      (results, term) =>
        matchSorter(results, term, { keys: [(k) => k.content] }),
      items,
    );
  }, [query, items]);
  return (
    <Stack spacing={4}>
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
      <Stack spacing={2}>
        {filtered.length === 0 && (
          <Typography sx={{ fontStyle: "italic" }}>
            No question in question bank
          </Typography>
        )}
        {filtered.map(({ content, id }) => {
          return (
            <Card key={id} variant="outlined">
              <CardContent>
                <Stack spacing={1}>
                  <Box>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        props.onSelect(content);
                      }}
                    >
                      Insert
                    </Button>
                  </Box>
                  <Typography sx={{ fontFamily: "monospace" }}>
                    {content}
                  </Typography>
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
