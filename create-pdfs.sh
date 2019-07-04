#!/bin/bash

python3 main.py
sudo chromium-browser --no-sandbox --headless --disable-gpu --print-to-pdf=output.pdf --disable-features=VizDisplayCompositor http://localhost:8000/report.html
