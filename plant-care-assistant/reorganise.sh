#!/bin/bash

# Base paths
APP_DIR="./app"
FEATURES_DIR="$APP_DIR/features"
SHARED_COMPONENTS_DIR="./components"
SHARED_STYLES_DIR="./styles"

# Create features directory
mkdir -p "$FEATURES_DIR"

# Move feature folders into features/
for feature in calendar feed login register; do
  if [ -d "$APP_DIR/$feature" ]; then
    echo "Moving $feature into features/"
    mv "$APP_DIR/$feature" "$FEATURES_DIR/$feature"
  else
    echo "Skipping $feature – not found"
  fi
done

# Move components and styles to the project root if needed
if [ -d "$APP_DIR/components" ]; then
  echo "Moving shared components to root"
  mv "$APP_DIR/components" "$SHARED_COMPONENTS_DIR"
fi

if [ -d "$APP_DIR/styles" ]; then
  echo "Moving styles to root"
  mv "$APP_DIR/styles" "$SHARED_STYLES_DIR"
fi

echo "✅ Project reorganization complete!"
echo "📌 Don't forget to fix your import paths or use a VS Code extension to auto-update them."
