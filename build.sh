#!/bin/bash

set -e

npm run build
mkdir -p build
(cd dist && zip -r - .) > build/idm-ui.zip
