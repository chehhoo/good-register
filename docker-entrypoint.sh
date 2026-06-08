#!/bin/sh
set -e

envsubst '${BACKEND_HOST}' \
    < /etc/nginx/available/default.conf.template \
    > /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"
