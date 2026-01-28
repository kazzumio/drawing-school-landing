const fs = require('fs-extra');
const path = require('path');
const CleanCSS = require('clean-css');
const Terser = require('terser');
const config = require('./config');
const glob = require('glob');

const cleanCSS = new CleanCSS();

// тут генерируется хэш
function genHash(length = 6) {
  return Math.random().toString(36).slice(2, 2 + length);
}

// рекурсивное копирование папки assets
function copyAssets(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.ensureDirSync(dest);

  fs.readdirSync(src).forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyAssets(srcPath, destPath);
    } else {
      fs.copySync(srcPath, destPath);
    }
  });
}

async function build() {
  const startTime = Date.now();

  fs.emptyDirSync('build');

  copyAssets('src/assets', 'build/assets');
  console.log('📂 Папка assets скопирована в build/assets');


  // новая систем интеграции библиотек в конечный билд
  if (config.libraries) {
    const vendorsBase = 'build/assets/vendors';
  
    for (const [libName, lib] of Object.entries(config.libraries)) {
      const libDir = path.join(vendorsBase, libName);
      fs.ensureDirSync(libDir);
  
      for (const [type, entries] of Object.entries(lib)) {
        const targetDir = path.join(libDir, type);
        fs.ensureDirSync(targetDir);
  
        for (const entry of entries) {
          if (entry.includes('*')) {
            // glob (webfonts)
            glob.sync(entry).forEach(file => {
              fs.copySync(file, path.join(targetDir, path.basename(file)));
            });
          } else {
            fs.copySync(entry, path.join(targetDir, path.basename(entry)));
          }
        }
      }
  
      console.log(`📦 Vendor ${libName} встроен в ${libDir}`);
    }
  }
  

  const commonDir = 'src/common';
  const commonBuildDir = 'build/common';
  const commonMap = {};

  if (fs.existsSync(commonDir)) {
    fs.ensureDirSync(commonBuildDir);

    const files = fs.readdirSync(commonDir);

    // CSS
    for (const file of files.filter(f => f.endsWith('.css') && !f.includes('.min'))) {
      const hash = genHash();
      const minName = file.replace('.css', `.min.${hash}.css`);
      const content = fs.readFileSync(path.join(commonDir, file), 'utf8');
      fs.writeFileSync(path.join(commonBuildDir, minName), cleanCSS.minify(content).styles);
      commonMap[file] = minName;
      console.log(`📦 common CSS: ${file} → ${minName}`);
    }

    // JS
    for (const file of files.filter(f => f.endsWith('.js') && !f.includes('.min'))) {
      const hash = genHash();
      const minName = file.replace('.js', `.min.${hash}.js`);
      const content = fs.readFileSync(path.join(commonDir, file), 'utf8');
      const minified = await Terser.minify(content, { compress: true, mangle: true });
      fs.writeFileSync(path.join(commonBuildDir, minName), minified.code || content);
      commonMap[file] = minName;
      console.log(`📦 common JS: ${file} → ${minName}`);
    }

    // other
    for (const file of files.filter(f => !f.endsWith('.css') && !f.endsWith('.js'))) {
      fs.copySync(path.join(commonDir, file), path.join(commonBuildDir, file));
    }
  }

  // тут собираем файлы страниц
  // обновляя пути к минифицированм страницам
  const pagesDir = 'src/pages';
  const pageFolders = fs.readdirSync(pagesDir).filter(f =>
    fs.statSync(path.join(pagesDir, f)).isDirectory()
  );

  for (const folder of pageFolders) {
    const pagePath = path.join(pagesDir, folder);
    const buildPath = path.join('build/pages', folder);
    fs.ensureDirSync(buildPath);

    const htmlPath = path.join(pagePath, `${folder}.html`);
    if (!fs.existsSync(htmlPath)) continue;

    let html = fs.readFileSync(htmlPath, 'utf8');
    const pageMap = {};

    const files = fs.readdirSync(pagePath);

    // CSS
    for (const file of files.filter(f => f.endsWith('.css') && !f.includes('.min'))) {
      const hash = genHash();
      const minName = file.replace('.css', `.min.${hash}.css`);
      const content = fs.readFileSync(path.join(pagePath, file), 'utf8');
      fs.writeFileSync(path.join(buildPath, minName), cleanCSS.minify(content).styles);
      pageMap[file] = minName;
    }

    // JS
    for (const file of files.filter(f => f.endsWith('.js') && !f.includes('.min'))) {
      const hash = genHash();
      const minName = file.replace('.js', `.min.${hash}.js`);
      const content = fs.readFileSync(path.join(pagePath, file), 'utf8');
      const minified = await Terser.minify(content, { compress: true, mangle: true });
      fs.writeFileSync(path.join(buildPath, minName), minified.code || content);
      pageMap[file] = minName;
    }

    // заменяем ссыолки например с main.css -> main.min.qkwd12e.css
    function replaceLinks(map) {
      Object.entries(map).forEach(([orig, min]) => {
        const ext = path.extname(orig);
        const attr = ext === '.css' ? 'href' : 'src';
        const tag = ext === '.css' ? 'link' : 'script';
        const regex = new RegExp(`(<${tag}[^>]*${attr}=["'][^"']*)${orig}(["'])`, 'gi');
        html = html.replace(regex, `$1${min}$2`);
      });
    }

    // то же самое что и выше но с обюющими файлами
    function replaceCommonLinks(map) {
      Object.entries(map).forEach(([orig, min]) => {
        const ext = path.extname(orig);
        const attr = ext === '.css' ? 'href' : 'src';
        const tag = ext === '.css' ? 'link' : 'script';
        const regex = new RegExp(`(<${tag}[^>]*${attr}=["'])([^"']*)${orig}([^"']*)(["'])`, 'gi');
        html = html.replace(regex, (_, p1, pathBefore, tail, p4) => {
          return `${p1}${pathBefore}${min}${tail}${p4}`;
        });
      });
    }

    replaceLinks(pageMap);
    replaceCommonLinks(commonMap);

    fs.writeFileSync(path.join(buildPath, `${folder}.html`), html);

    // other files
    for (const file of files.filter(f =>
      !f.endsWith('.html') && !f.endsWith('.css') && !f.endsWith('.js')
    )) {
      fs.copySync(path.join(pagePath, file), path.join(buildPath, file));
    }

    console.log(`📄 Страница ${folder} собрана`);
  }

  console.log(`✅ Сборка завершена за ${Date.now() - startTime}мс`);
}

build().catch(console.error);
