#!/bin/bash
RES_DIR="android/app/src/main/res"

# Generate Icons
echo "Generating icons..."
# mdpi
ffmpeg -i resources/icon.svg -s 48x48 $RES_DIR/mipmap-mdpi/ic_launcher.png -y
ffmpeg -i resources/icon.svg -s 48x48 $RES_DIR/mipmap-mdpi/ic_launcher_round.png -y
ffmpeg -i resources/icon-foreground.svg -s 108x108 $RES_DIR/mipmap-mdpi/ic_launcher_foreground.png -y

# hdpi
ffmpeg -i resources/icon.svg -s 72x72 $RES_DIR/mipmap-hdpi/ic_launcher.png -y
ffmpeg -i resources/icon.svg -s 72x72 $RES_DIR/mipmap-hdpi/ic_launcher_round.png -y
ffmpeg -i resources/icon-foreground.svg -s 162x162 $RES_DIR/mipmap-hdpi/ic_launcher_foreground.png -y

# xhdpi
ffmpeg -i resources/icon.svg -s 96x96 $RES_DIR/mipmap-xhdpi/ic_launcher.png -y
ffmpeg -i resources/icon.svg -s 96x96 $RES_DIR/mipmap-xhdpi/ic_launcher_round.png -y
ffmpeg -i resources/icon-foreground.svg -s 216x216 $RES_DIR/mipmap-xhdpi/ic_launcher_foreground.png -y

# xxhdpi
ffmpeg -i resources/icon.svg -s 144x144 $RES_DIR/mipmap-xxhdpi/ic_launcher.png -y
ffmpeg -i resources/icon.svg -s 144x144 $RES_DIR/mipmap-xxhdpi/ic_launcher_round.png -y
ffmpeg -i resources/icon-foreground.svg -s 324x324 $RES_DIR/mipmap-xxhdpi/ic_launcher_foreground.png -y

# xxxhdpi
ffmpeg -i resources/icon.svg -s 192x192 $RES_DIR/mipmap-xxxhdpi/ic_launcher.png -y
ffmpeg -i resources/icon.svg -s 192x192 $RES_DIR/mipmap-xxxhdpi/ic_launcher_round.png -y
ffmpeg -i resources/icon-foreground.svg -s 432x432 $RES_DIR/mipmap-xxxhdpi/ic_launcher_foreground.png -y

# Generate Splashes
echo "Generating splashes..."
for d in $RES_DIR/drawable-*; do
  if [ -f "$d/splash.png" ]; then
    echo "Updating $d/splash.png"
    ffmpeg -i resources/splash.svg -s 1024x1024 "$d/splash.png" -y
  fi
done
ffmpeg -i resources/splash.svg -s 1024x1024 $RES_DIR/drawable/splash.png -y

echo "Done!"
