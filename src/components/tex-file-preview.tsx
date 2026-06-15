import { AriaAttributes, FC, Suspense, use } from "react";

const Inner: FC<{
  getTokensPromise: Promise<
    Array<{ kind: "Marker"; key: string } | { kind: "TexCharacter"; c: string }>
  >;
}> = (props) => {
  const tokens = use(props.getTokensPromise);
  return (
    <pre>
      {tokens.map((tok, i) => {
        if (tok.kind === "Marker") {
          return (
            <span key={i} style={{ fontWeight: 700 }}>
              {tok.key}
            </span>
          );
        }
        return (
          <pre style={{ display: "inline" }} key={i}>
            {tok.c}
          </pre>
        );
      })}
    </pre>
  );
};

export const TexFilePreview: FC<{
  getFileToken: Promise<
    Array<{ kind: "Marker"; key: string } | { kind: "TexCharacter"; c: string }>
  >;
}> = (props) => {
  return (
    <Suspense fallback={"WORKING"}>
      <Inner getTokensPromise={props.getFileToken} />
    </Suspense>
  );
};
