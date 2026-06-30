import Typography from "@mui/material/Typography";
import { type FC, useEffect } from "react";
import type { TokenKind } from "../api/tex-builk-edit";

export const TexFilePreview: FC<{
  highlight?: {
    marker: string;
    order: number;
  };
  fontSize: number;
  tokens: Array<TokenKind>;
  replacements: Record<string, string>;
}> = (props) => {
  useEffect(() => {
    if (props.highlight !== undefined) {
      const el = document.getElementById(
        `${props.highlight.marker}-${props.highlight.order}`,
      );
      if (el !== null) {
        el.scrollIntoView();
      }
    }
  }, [props.highlight]);
  return (
    <Typography
      component={"pre"}
      sx={{
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
        maxWidth: "100%",
        overflowX: "hidden",
        fontFamily: "monospace",
        fontSize: props.fontSize,
        color: (t) => t.lighten(t.palette.primary.main, 0.07),
      }}
    >
      {props.tokens.map((tok, i) => {
        if (tok.kind === "Marker") {
          const replacement = props.replacements[tok.key];

          const order = props.tokens
            .slice(0, i)
            .filter((t) => t.kind === "Marker" && t.key === tok.key).length;
          const isHighlighted =
            props.highlight !== undefined &&
            props.highlight.marker === tok.key &&
            props.highlight.order === order;

          return (
            <Typography
              id={`${tok.key}-${order}`}
              key={i}
              component="pre"
              sx={{
                fontSize: "inherit",
                display: "inline",
                ...(!isHighlighted
                  ? undefined
                  : {
                      backgroundColor: (t) =>
                        t.alpha(t.palette.primary.main, 0.2),
                    }),
              }}
            >
              <Typography
                component="pre"
                sx={{
                  fontSize: "inherit",
                  display: "inline",
                  fontFamily: "monospace",
                  color: (t) =>
                    replacement === ""
                      ? t.palette.primary.main
                      : t.palette.action.disabled,
                  fontWeight: 700,
                }}
              >
                {`<<<(${tok.key})>>>`}
              </Typography>

              {replacement !== "" && (
                <>
                  {` \u27F6 `}
                  <Typography
                    component="pre"
                    sx={{
                      display: "inline",
                      fontFamily: "monospace",
                      color: (t) => t.palette.primary.main,
                      fontWeight: 700,
                    }}
                  >
                    {replacement}
                  </Typography>
                </>
              )}
            </Typography>
          );
        }
        return tok.content;
      })}
    </Typography>
  );
};
