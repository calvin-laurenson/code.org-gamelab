#!/bin/zsh
while inotifywait -e close_write ./lib/index.js; do copyq copy - < ./lib/index.js; done