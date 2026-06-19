import { invoke } from "@tauri-apps/api/core";

export type Question = {
  id: number;
  content: string;
};

export function createQuestion(content: string) {
  return invoke<Question>("create_question", {
    input: { content },
  });
}

export function listQuestions() {
  return invoke<Question[]>("list_questions");
}

export function updateQuestion(id: number, content: string) {
  return invoke<Question>("update_question", {
    input: { id, content },
  });
}

export function deleteQuestion(id: number) {
  return invoke<void>("delete_question", {
    id,
  });
}
