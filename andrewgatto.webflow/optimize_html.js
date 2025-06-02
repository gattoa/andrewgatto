#!/usr/bin/env node

// HTML Optimization Script for Portfolio
// Adds lazy loading and WebP support with fallbacks

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting HTML optimization...');

// Function to add lazy loading and WebP support to img tags
function optimizeImgTags(html) {
    return html.replace(/<img([^>]*?)src=["']([^"']*?)["']([^>]*?)>/gi, (match, beforeSrc, imgSrc, afterSrc) => {
        // Skip if already has loading attribute
        if (match.includes('loading=')) {
            return match;
        }
        
        // Extract filename without extension for WebP version
        const fileName = imgSrc.replace(/^.*[\\\/]/, ''); // Get filename
        const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, ""); // Remove extension
        const webpSrc = `optimized_images/webp/${fileNameWithoutExt}.webp`;
        const optimizedSrc = imgSrc.replace('images/', 'optimized_images/');
        
        // Create picture element with WebP support and lazy loading
        return `<picture>
  <source srcset="${webpSrc}" type="image/webp">
  <img${beforeSrc}src="${optimizedSrc}"${afterSrc} loading="lazy">
</picture>`;
    });
}

// Function to add CSS for lazy loading and smooth transitions
function addOptimizationCSS() {
    return `
<style>
/* Image optimization styles */
img {
    transition: opacity 0.3s ease;
}

img[loading="lazy"] {
    opacity: 0;
}

img[loading="lazy"].loaded {
    opacity: 1;
}

/* Fallback for browsers that don't support lazy loading */
.no-lazy-loading img[loading="lazy"] {
    opacity: 1;
}

/* Optimize images for mobile */
@media (max-width: 768px) {
    img {
        height: auto;
        max-width: 100%;
    }
}
</style>`;
}

// Function to add lazy loading JavaScript
function addLazyLoadingJS() {
    return `
<script>
// Lazy loading polyfill for older browsers
if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.addEventListener('load', () => {
            img.classList.add('loaded');
        });
    });
} else {
    // Fallback for browsers that don't support lazy loading
    document.body.classList.add('no-lazy-loading');
    
    // Intersection Observer polyfill for lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.dataset.src = img.src;
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';
        imageObserver.observe(img);
    });
}
</script>`;
}

// Function to process a single HTML file
function processHTMLFile(filePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf8');
        
        // Add lazy loading and WebP support to images
        let optimizedHTML = optimizeImgTags(html);
        
        // Add optimization CSS before closing head tag
        optimizedHTML = optimizedHTML.replace('</head>', addOptimizationCSS() + '\n</head>');
        
        // Add lazy loading JS before closing body tag
        optimizedHTML = optimizedHTML.replace('</body>', addLazyLoadingJS() + '\n</body>');
        
        // Create backup
        const backupPath = filePath + '.backup';
        fs.copyFileSync(filePath, backupPath);
        
        // Write optimized HTML
        fs.writeFileSync(filePath, optimizedHTML);
        
        console.log(`✅ Optimized: ${path.basename(filePath)}`);
        return true;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Function to find and process all HTML files
function processAllHTMLFiles() {
    const htmlFiles = [];
    
    // Main HTML files
    const mainFiles = ['index.html', 'about.html', '401.html', '404.html', 'home-copy.html', 'lab02.html', 'styleguide.html'];
    mainFiles.forEach(file => {
        if (fs.existsSync(file)) {
            htmlFiles.push(file);
        }
    });
    
    // Work directory HTML files
    if (fs.existsSync('work')) {
        const workFiles = fs.readdirSync('work').filter(file => file.endsWith('.html'));
        workFiles.forEach(file => {
            htmlFiles.push(path.join('work', file));
        });
    }
    
    let processedCount = 0;
    htmlFiles.forEach(file => {
        if (processHTMLFile(file)) {
            processedCount++;
        }
    });
    
    console.log(`\n🎉 HTML optimization complete!`);
    console.log(`📊 Processed ${processedCount} out of ${htmlFiles.length} HTML files`);
    console.log(`📋 Backup files created with .backup extension`);
    
    return processedCount;
}

// Main execution
if (require.main === module) {
    try {
        const processed = processAllHTMLFiles();
        
        console.log(`\n📈 Next steps:`);
        console.log(`1. ✅ Images optimized and WebP versions created`);
        console.log(`2. ✅ HTML files updated with lazy loading and WebP support`);
        console.log(`3. 🔄 Test the site to ensure everything works correctly`);
        console.log(`4. 🚀 Ready to deploy optimized version`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Script failed:', error.message);
        process.exit(1);
    }
}

module.exports = { processHTMLFile, optimizeImgTags }; 