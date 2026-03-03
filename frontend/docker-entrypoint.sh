#!/bin/sh

# If VITE_API_URL is set, replace the placeholder in all built JS files
if [ -n "$VITE_API_URL" ]; then
  echo "Injecting runtime VITE_API_URL: $VITE_API_URL"
  find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|__RUNTIME_API_URL__|$VITE_API_URL|g" {} +
  find /usr/share/nginx/html -type f -name "*.html" -exec sed -i "s|__RUNTIME_API_URL__|$VITE_API_URL|g" {} +
fi

# Do not call exec "$@" here, because Nginx will run this automatically from /docker-entrypoint.d/
