#!/bin/sh
## Licensed under the terms of http://www.apache.org/licenses/LICENSE-2.0
set -e

echo "Starting Jena Docker container"
echo "========================================================"

${FUSEKI_SERVER} --mem /ds

echo "Jena Docker container started"

