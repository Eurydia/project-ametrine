use serde::Serialize;
use serde_json::map::Entry;
use std::{collections::HashMap, marker, ops::Add, string};

#[derive(Debug, Serialize)]
#[serde(tag = "kind")]
pub enum TokenKind {
    TexString { content: String },
    Marker { key: String },
}

fn consume_expected<I>(src_stream: &mut I, string_buffer: &mut String, expected: char) -> bool
where
    I: Iterator<Item = char>,
{
    match src_stream.next() {
        Some(ch) if ch == expected => {
            string_buffer.push(ch);
            return true;
        }
        Some(ch) => {
            string_buffer.push(ch);
            return false;
        }
        None => return false,
    };
}

fn consume_sequence<I>(src_stream: &mut I, string_buffer: &mut String, expected: &str) -> bool
where
    I: Iterator<Item = char>,
{
    for expected_ch in expected.chars() {
        if !consume_expected(src_stream, string_buffer, expected_ch) {
            return false;
        }
    }

    return true;
}

pub fn lex_string(src: String) -> Vec<TokenKind> {
    let mut tokens = vec![];
    let mut string_buffer = String::new();
    let mut src_stream = src.chars().peekable();

    while src_stream.peek().is_some() {
        let mut start_marker_buffer = String::new();
        if !consume_sequence(&mut src_stream, &mut start_marker_buffer, "<<<(") {
            string_buffer.push_str(&start_marker_buffer);
            continue;
        }

        let mut marker_key = String::new();

        while let Some(&ch) = src_stream.peek() {
            src_stream.next();
            if ch == ')' {
                break;
            }
            marker_key.push(ch);
        }

        if marker_key.is_empty() {
            string_buffer.push(')');
            continue;
        }

        let mut end_marker_buffer = String::new();

        if !consume_sequence(&mut src_stream, &mut end_marker_buffer, ">>>") {
            string_buffer.push_str(&marker_key);
            string_buffer.push_str(&end_marker_buffer);
            continue;
        }

        tokens.push(TokenKind::TexString {
            content: string_buffer.clone(),
        });
        string_buffer.clear();
        tokens.push(TokenKind::Marker { key: marker_key });
    }

    if !string_buffer.is_empty() {
        tokens.push(TokenKind::TexString {
            content: string_buffer,
        });
    }

    return tokens;
}

pub fn replace_string(
    tokens: Vec<TokenKind>,
    replacements: HashMap<String, String>,
) -> Option<String> {
    let mut repalced_string = String::new();

    for token in tokens {
        match token {
            TokenKind::TexString { content } => {
                repalced_string.push_str(content.as_str());
            }
            TokenKind::Marker { key } => {
                let Some(marker_value) = replacements.get(&key) else {
                    return None;
                };
                repalced_string.push_str(marker_value);
            }
        }
    }

    return Some(repalced_string);
}

pub fn get_marker_keys(tokens: Vec<TokenKind>) -> HashMap<String, i32> {
    let mut keys = HashMap::new();
    for token in tokens {
        match token {
            TokenKind::Marker { key } => {
                let occurences = keys.entry(key).or_insert(0);
                *occurences += 1;
            }
            _ => {}
        }
    }
    return keys;
}
