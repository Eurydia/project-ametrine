import { invoke } from "@tauri-apps/api/core";

export type Question = {
  id: number;
  content: string;
  tags: Array<string>;
};

export function createQuestion(value: {
  content: string;
  tags: Array<string>;
}) {
  return invoke<Question>("create_question", {
    data: value,
  });
}

export function listQuestions() {
  return invoke<Question[]>("list_questions");
}

export function updateQuestion(value: {
  id: number;
  content: string;
  tags: Array<string>;
}) {
  return invoke<Question>("update_question", {
    data: value,
  });
}

export function deleteQuestion(id: number) {
  return invoke<number>("delete_question", {
    id,
  });
}
