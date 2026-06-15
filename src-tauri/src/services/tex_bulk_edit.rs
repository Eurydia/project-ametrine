use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug, Serialize)]
#[serde(tag = "kind")]
pub enum TokenKind {
    TexChar { c: char },
    Marker { key: String },
}

fn flush_buffer_as_chars(tokens_vec: &mut Vec<TokenKind>, char_buffer: &Vec<char>) {
    for buffer_ch in char_buffer {
        tokens_vec.push(TokenKind::TexChar { c: *buffer_ch });
    }
}

fn consume_expected<I>(src_stream: &mut I, buffer: &mut Vec<char>, expected: char) -> bool
where
    I: Iterator<Item = char>,
{
    match src_stream.next() {
        Some(ch) if ch == expected => {
            buffer.push(ch);
            return true;
        }
        Some(ch) => {
            buffer.push(ch);
            return false;
        }
        None => return false,
    };
}

fn consume_sequence<I>(src_stream: &mut I, buffer: &mut Vec<char>, expected: &str) -> bool
where
    I: Iterator<Item = char>,
{
    for expected_ch in expected.chars() {
        if !consume_expected(src_stream, buffer, expected_ch) {
            return false;
        }
    }

    return true;
}

pub fn lex_string(src: String) -> Vec<TokenKind> {
    let mut tokens = vec![];

    let mut src_stream = src.chars().peekable();

    'src: while let Some(stream_ch) = src_stream.next() {
        match stream_ch {
            '<' => {
                let mut buffer = vec![];

                buffer.push(stream_ch);

                if !consume_sequence(&mut src_stream, &mut buffer, "<<(") {
                    flush_buffer_as_chars(&mut tokens, &buffer);
                    continue 'src;
                }

                let mut marker_key = String::new();

                loop {
                    match src_stream.next() {
                        Some(ch) if ch == ')' => {
                            buffer.push(ch);
                            break;
                        }
                        Some(ch) => {
                            marker_key.push(ch);
                            buffer.push(ch);
                        }
                        None => {
                            flush_buffer_as_chars(&mut tokens, &buffer);
                            return tokens;
                        }
                    }
                }

                if !consume_sequence(&mut src_stream, &mut buffer, ">>>") {
                    flush_buffer_as_chars(&mut tokens, &buffer);
                    continue 'src;
                }

                if marker_key.is_empty() {
                    flush_buffer_as_chars(&mut tokens, &buffer);
                    continue 'src;
                }

                tokens.push(TokenKind::Marker { key: marker_key });
            }

            _ => tokens.push(TokenKind::TexChar { c: stream_ch }),
        }
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
            TokenKind::TexChar { c } => {
                repalced_string.push(c);
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

pub fn get_marker_keys(tokens: Vec<TokenKind>) -> Vec<String> {
    let mut keys = vec![];
    for token in tokens {
        match token {
            TokenKind::Marker { key } => {
                keys.push(key);
            }
            _ => {}
        }
    }
    return keys;
}
