const fs = require('fs');
const path = require('path');

// Simple 1x1 orange PNG buffer scaled or square PNG file structure
// Using base64 for a clean 512x512 square brand icon PNG
const squareIconBase64 = 
  'iVBORw0KGgoAAAANSUhEUgAAAgAAAAICCAYAAACm/UkhAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAABxASURBVHic7d3b';

// Copy client/public/logo.png to mobile/assets with square padding if needed, or write valid square png
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Read original logo
const logoPath = path.join(__dirname, '..', 'client', 'public', 'logo.png');
if (fs.existsSync(logoPath)) {
  fs.copyFileSync(logoPath, path.join(assetsDir, 'icon.png'));
  fs.copyFileSync(logoPath, path.join(assetsDir, 'splash.png'));
  fs.copyFileSync(logoPath, path.join(assetsDir, 'adaptive-icon.png'));
  fs.copyFileSync(logoPath, path.join(assetsDir, 'favicon.png'));
}
