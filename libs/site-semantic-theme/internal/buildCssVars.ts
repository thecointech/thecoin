import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extract color variables from the site.variables file
const extractColorVariables = () => {
  const siteVarsPath = path.join(__dirname, '..', 'src', 'semantic', 'thecoin', 'globals', 'site.variables');
  const content = fs.readFileSync(siteVarsPath, 'utf-8');

  // First pass: extract all color variable definitions
  const theCoinPaletteRegex = /@theCoinPalette(\w+(?:\w*)*)\s*:\s*(.+?);/g;
  const theCoinColorRegex = /@(theCoinPrimaryRed|theCoinPrimaryGreen|theCoinSecondaryGreen)(\w*)\s*:\s*(.+?);/g;
  const semanticColorRegex = /@(primaryColor|textColor|secondaryColor|lightPrimaryColor|lightSecondaryColor|textLightColor|hoveredTextColor|selectedTextColor|primaryColor\d|primaryColor\dHover|primaryColor\dActive)\s*:\s*(.+?);/g;

  const colors: Record<string, string> = {};
  const originalColors: Record<string, string> = {};
  let match;

  // Store all theCoinPalette variables first
  while ((match = theCoinPaletteRegex.exec(content)) !== null) {
    const [, name, value] = match;
    originalColors[name] = value.trim();
  }

  // Store theCoinPrimary* and theCoinSecondary* variables
  while ((match = theCoinColorRegex.exec(content)) !== null) {
    const [, prefix, suffix, value] = match;
    const fullName = prefix + suffix;
    originalColors[fullName] = value.trim();
  }

  // Store semantic color variables
  while ((match = semanticColorRegex.exec(content)) !== null) {
    const [, name, value] = match;
    originalColors[name] = value.trim();
  }

  // Second pass: resolve variables and handle fade() functions
  for (const [name, value] of Object.entries(originalColors)) {
    let cleanValue = value;

    // Handle fade() function - extract the base color and resolve it
    if (cleanValue.includes('fade(')) {
      const fadeMatch = cleanValue.match(/fade\(([^,]+),\s*\d+%\)/);
      if (fadeMatch) {
        const colorRef = fadeMatch[1].trim();
        // Remove @ prefix if it's a variable reference
        if (colorRef.startsWith('@theCoinPalette')) {
          const varName = colorRef.replace('@theCoinPalette', '');
          if (originalColors[varName]) {
            const baseColorMatch = originalColors[varName].match(/#\w+/);
            cleanValue = baseColorMatch ? baseColorMatch[0] : colorRef;
          }
        } else {
          cleanValue = colorRef;
        }
      }
    }
    // Handle linear-gradient - skip for now
    else if (cleanValue.includes('linear-gradient')) {
      continue;
    }
    // Handle variable references (like @theCoinPaletteGray1 or @theCoinPrimaryRedPale)
    else if (cleanValue.startsWith('@')) {
      // Handle theCoinPalette references
      if (cleanValue.startsWith('@theCoinPalette')) {
        const varName = cleanValue.replace('@theCoinPalette', '');
        if (originalColors[varName]) {
          const baseColorMatch = originalColors[varName].match(/#\w+/);
          cleanValue = baseColorMatch ? baseColorMatch[0] : cleanValue;
        }
      }
      // Handle theCoinPrimary* and theCoinSecondary* references
      else if (cleanValue.startsWith('@theCoin')) {
        const varName = cleanValue.replace('@theCoin', '');
        if (originalColors[varName]) {
          const baseColorMatch = originalColors[varName].match(/#\w+/);
          cleanValue = baseColorMatch ? baseColorMatch[0] : cleanValue;
        }
      }
      // Handle other semantic color references
      else if (originalColors[cleanValue.replace('@', '')]) {
        const refValue = originalColors[cleanValue.replace('@', '')];
        const baseColorMatch = refValue.match(/#\w+/);
        cleanValue = baseColorMatch ? baseColorMatch[0] : cleanValue;
      }
      // Handle generic color references like @grey, @lightOlive, @white, @black
      else if (cleanValue === '@grey' || cleanValue === '@gray') {
        cleanValue = '#6F6571'; // Default gray from theCoinPaletteGray1
      }
      else if (cleanValue === '@lightOlive') {
        cleanValue = '#20B58D'; // Default to theCoinPaletteGreen3
      }
      else if (cleanValue === '@white') {
        cleanValue = '#FFFFFF';
      }
      else if (cleanValue === '@black') {
        cleanValue = '#000000';
      }
    }
    // Extract hex color from any remaining values
    else {
      const hexMatch = cleanValue.match(/#\w+/);
      if (hexMatch) {
        cleanValue = hexMatch[0];
      }
    }

    // Remove any trailing semicolons
    cleanValue = cleanValue.replace(/;$/, '');

    // Only store if we have a valid color value
    if (cleanValue && cleanValue.startsWith('#')) {
      colors[name] = cleanValue;
    }
  }

  return colors;
};

// Generate CSS custom properties
const generateCssVars = () => {
  const colors = extractColorVariables();

  let css = ':root {\n';
  for (const [name, value] of Object.entries(colors)) {
    // Convert PascalCase to kebab-case with single dash
    let cssName = `--thecoin-${name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/-+/g, '-').replace(/^-+|-+$/g, '')}`;

    // For semantic colors, use simpler naming without thecoin prefix
    if (name === 'primaryColor' || name === 'primaryColorHover' || name === 'primaryColorActive' ||
        name === 'secondaryColor' || name === 'textColor' || name === 'textDarkColor' ||
        name === 'lightPrimaryColor' || name === 'lightSecondaryColor' || name === 'textLightColor' ||
        name === 'hoveredTextColor' || name === 'selectedTextColor') {
      cssName = `--${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    }

    css += `  ${cssName}: ${value};\n`;
  }
  css += '}\n\n';

  // Add utility classes for common colors
  css += '/* Utility classes for common colors */\n';
  css += '.tc-pale-green-1 { color: var(--thecoin-pale-green1); }\n';
  css += '.tc-pale-green-2 { color: var(--thecoin-pale-green2); }\n';
  css += '.tc-green-3 { color: var(--thecoin-green3); }\n';
  css += '.tc-green-4 { color: var(--thecoin-green4); }\n';
  css += '.tc-green-5 { color: var(--thecoin-green5); }\n';
  css += '.tc-gold-2 { color: var(--thecoin-gold2); }\n';
  css += '.tc-gold-4 { color: var(--thecoin-gold4); }\n';
  css += '.tc-red-2 { color: var(--thecoin-red2); }\n';
  css += '.tc-blue-1 { color: var(--thecoin-blue1); }\n';
  css += '.tc-gray-1 { color: var(--thecoin-gray1); }\n';

  // Add utility classes for semantic colors
  css += '\n/* Utility classes for semantic colors */\n';
  css += '.tc-primary { color: var(--primary-color); }\n';
  css += '.tc-primary-hover { color: var(--primary-color-hover); }\n';
  css += '.tc-primary-active { color: var(--primary-color-active); }\n';
  css += '.tc-secondary { color: var(--secondary-color); }\n';
  css += '.tc-text { color: var(--text-color); }\n';
  css += '.tc-text-dark { color: var(--text-dark-color); }\n';
  css += '.tc-text-light { color: var(--text-light-color); }\n';
  css += '.tc-text-hovered { color: var(--hovered-text-color); }\n';
  css += '.tc-text-selected { color: var(--selected-text-color); }\n';
  css += '.tc-light-primary { color: var(--light-primary-color); }\n';
  css += '.tc-light-secondary { color: var(--light-secondary-color); }\n';

  return css;
};

// Write the CSS variables file
const siteRoot = path.join(process.cwd(), "src");
const outputFolder = path.join(siteRoot, "semantic");
const outputFilename = path.join(outputFolder, "thecoin-colors.css");

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

const cssVars = generateCssVars();
fs.writeFileSync(outputFilename, cssVars);

console.log(`CSS variables written to ${outputFilename}`);
