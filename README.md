# asa-judging

Script for verifying ASA rubric scores.

Set up the scores under the `scores/` directory with `git secret reveal`. Run the script, and it will build up the internal score mapping and process the data as requested (`process_fn`) at the end of `main()`.

## Python venv

```
python3 -m venv env
```
