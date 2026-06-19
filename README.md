# Project AMETRINE

There does not appear to have any LaTeX tool that I could find that does the bulk edit operation. In essence, the application opens one or more LaTeX document and look for a certain marker, which looks like this ``<<<(MARKER_KEY)>>>``. More specifically, the string between the open and close parentheses defines the name of that marker. Naturally, we can target and substitute these markers with a new string of our choice. TeXStudio seems to provide this functionality to a certain degree, but one for one file at a time. This particular application allows bulk substitution across multiple files. 

We also get a bonus function that we could implement a question bank generator where markers are placed in a file, for example, ``<<<(Q1)>>>``, ``<<<(Q2)>>>``, and ``<<<(Q3)>>>``. We can then substitute these with concrete questions from the question bank.

