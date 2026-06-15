import { Button, Stack } from "@mui/material";
import { FC } from "react";
import { useDropzone } from "react-dropzone";

export const LatexDropzone: FC<{
  onFileAccepted?: (files: File[]) => unknown;
}> = (props) => {
  const { getInputProps, open } = useDropzone({
    accept: {
      "text/x-tex": [".tex"],
    },
    multiple: true,
    noClick: true,
    noKeyboard: true,
    noDrag: true,
    noDragEventsBubbling: true,
    onDropAccepted: props.onFileAccepted,
  });

  return (
    <>
      <input {...getInputProps()} />
      <Button variant="contained" onClick={open}>
        Choose files
      </Button>
    </>
  );
};
