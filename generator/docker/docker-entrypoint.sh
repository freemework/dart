#!/bin/sh
#

TEMPLATE="${1}"

if [ -z "${TEMPLATE}" ]; then
    echo "Template name was not provided" >&2
    exit 1
fi

TEMPLATE_DIR="generator/templates/${TEMPLATE}"
if [ ! -d "${TEMPLATE_DIR}" ]; then
    echo "Template '${TEMPLATE_DIR}' directory not found" >&2
    exit 2
fi

echo
echo "Enum of currencies generator is started. Target template is '${TEMPLATE}'."
echo


TEMPFILE=$(tempfile)
echo "---" >> "${TEMPFILE}"

echo "data:" >> "${TEMPFILE}"
sed -n -e '/## Supported Currencies/,/## Refrences/ p' README.md | tail -n+5 | head -n-2 | while read LINE; do
    CURRENCY_CODE=$(echo $LINE | cut -f2 -d'|' | sed -e 's/^[[:space:]]*//' | sed 's/ *$//g')
    EXPONENT=$(echo $LINE | cut -f3 -d'|' | sed -e 's/^[[:space:]]*//' | sed 's/ *$//g')
    ISO4217=$(echo $LINE | cut -f4 -d'|' | sed -e 's/^[[:space:]]*//' | sed 's/ *$//g')
    FIAT=$(echo $LINE | cut -f5 -d'|' | sed -e 's/^[[:space:]]*//' | sed 's/ *$//g')
    CRYPTO=$(echo $LINE | cut -f6 -d'|' | sed -e 's/^[[:space:]]*//' | sed 's/ *$//g')
    TITLE=$(echo $LINE | cut -f7 -d'|' | sed -e 's/^[[:space:]]*//' | sed 's/ *$//g')
    REFERENCE_URL=$(echo $LINE | cut -f8 -d'|' | sed -e 's/^[[:space:]]*//' | sed 's/ *$//g')

    echo "  - code: '${CURRENCY_CODE}'" >> "${TEMPFILE}"
    echo "    exponent: '${EXPONENT}'" >> "${TEMPFILE}"
    if [ -n "${ISO4217}" ]; then
        echo "    iso4217: '${ISO4217}'" >> "${TEMPFILE}"
    fi

    if [ -n "${FIAT}" ]; then
        echo "    isFiat: true" >> "${TEMPFILE}"
    else
        echo "    isFiat: false" >> "${TEMPFILE}"
    fi

    if [ -n "${CRYPTO}" ]; then
        echo "    isCrypto: true" >> "${TEMPFILE}"
    else
        echo "    isCrypto: false" >> "${TEMPFILE}"
    fi

    echo "    title: '${TITLE}'" >> "${TEMPFILE}"

    echo "    referenceURL: '${REFERENCE_URL}'" >> "${TEMPFILE}"

done

set -e

mkdir -p ".build/${TEMPLATE}"

find "${TEMPLATE_DIR}" -name '*.mustache' -follow -type f -exec sh -c 'DATA_FILE=${1} && TEMPLATE=${2} && TEMPLATE_FILE=${3} && TARGET_FILE=$(basename -s .mustache "${TEMPLATE_FILE}") && mustache "${DATA_FILE}" "${TEMPLATE_FILE}" > ".build/${TEMPLATE}/${TARGET_FILE}" && echo "Processed ${TARGET_FILE}"' _ "${TEMPFILE}" "${TEMPLATE}" "{}" \;

echo