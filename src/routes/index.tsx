import { invoke } from "@tauri-apps/api/core";
import { createFileRoute } from "@tanstack/react-router";
import Box from "@mui/material/Box";
import { LatexDropzone } from "../components/dropzone";
import { useState } from "react";
import { Stack, Typography } from "@mui/material";
import { TexFilePreview } from "../components/tex-file-preview";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <>
      <LatexDropzone
        onFileAccepted={(next) => {
          setFiles((prev) => [...prev, ...next]);
        }}
      />
      <Stack>
        {files.map((f, i) => (
          <TexFilePreview
            getFileToken={f
              .text()
              .then((fileContent) =>
                invoke("get_tokens", { texString: fileContent }),
              )}
            key={i}
          />
        ))}
      </Stack>
    </>
  );
}
