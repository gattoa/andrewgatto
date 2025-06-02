#!/bin/bash

# Image Optimization Script for Portfolio
# Phase 1: Quick wins without layout changes

set -e

echo "🎨 Starting image optimization..."
echo "Current images directory size:"
du -sh images/

# Create optimized directory structure
mkdir -p optimized_images
mkdir -p optimized_images/webp

# Function to optimize PNG files
optimize_png() {
    local input="$1"
    local output="$2"
    local basename=$(basename "$input")
    
    echo "📸 Optimizing PNG: $basename"
    
    # Use pngquant for high-quality compression (up to 80% size reduction)
    pngquant --quality=70-85 --force --output "$output" "$input" 2>/dev/null || {
        echo "⚠️  pngquant failed for $basename, copying original"
        cp "$input" "$output"
    }
    
    # Create WebP version
    cwebp -q 85 -m 6 "$input" -o "optimized_images/webp/${basename%.*}.webp" 2>/dev/null || {
        echo "⚠️  WebP conversion failed for $basename"
    }
}

# Function to optimize JPEG files
optimize_jpeg() {
    local input="$1"
    local output="$2"
    local basename=$(basename "$input")
    
    echo "📸 Optimizing JPEG: $basename"
    
    # Use jpegoptim for JPEG optimization
    jpegoptim --max=85 --strip-all --totals "$input" -d "$(dirname "$output")" 2>/dev/null || {
        echo "⚠️  jpegoptim failed for $basename, copying original"
        cp "$input" "$output"
    }
    
    # Create WebP version
    cwebp -q 85 -m 6 "$input" -o "optimized_images/webp/${basename%.*}.webp" 2>/dev/null || {
        echo "⚠️  WebP conversion failed for $basename"
    }
}

# Count total files for progress
total_files=$(find images/ -name "*.png" -o -name "*.jpeg" -o -name "*.jpg" | wc -l)
current_file=0

echo "📊 Found $total_files image files to optimize"
echo ""

# Process PNG files
echo "🔄 Processing PNG files..."
find images/ -name "*.png" -print0 | while IFS= read -r -d '' file; do
    current_file=$((current_file + 1))
    relative_path=${file#images/}
    output_path="optimized_images/$relative_path"
    
    # Create directory structure
    mkdir -p "$(dirname "$output_path")"
    
    echo "[$current_file/$total_files] Processing: $relative_path"
    optimize_png "$file" "$output_path"
done

# Process JPEG files
echo "🔄 Processing JPEG files..."
find images/ -name "*.jpeg" -o -name "*.jpg" -print0 | while IFS= read -r -d '' file; do
    current_file=$((current_file + 1))
    relative_path=${file#images/}
    output_path="optimized_images/$relative_path"
    
    # Create directory structure
    mkdir -p "$(dirname "$output_path")"
    
    echo "[$current_file/$total_files] Processing: $relative_path"
    optimize_jpeg "$file" "$output_path"
done

# Copy non-image files (SVG, etc.)
echo "📋 Copying non-raster image files..."
find images/ -type f ! -name "*.png" ! -name "*.jpeg" ! -name "*.jpg" -exec cp {} optimized_images/ \;

echo ""
echo "✅ Optimization complete!"
echo ""
echo "📊 Size comparison:"
echo "Original images:"
du -sh images/
echo "Optimized images:"
du -sh optimized_images/
echo "WebP images:"
du -sh optimized_images/webp/

# Calculate savings
original_size=$(du -s images/ | cut -f1)
optimized_size=$(du -s optimized_images/ | cut -f1)
savings=$((original_size - optimized_size))
percentage=$((savings * 100 / original_size))

echo ""
echo "💾 Space saved: ${percentage}% reduction"
echo "📈 Ready for Phase 1b: HTML updates for lazy loading and WebP support" 