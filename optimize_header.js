const fs = require('fs');
const path = require('path');

const files = [
  'client/src/app/skills/page.tsx',
  'client/src/app/roadmap/page.tsx',
  'client/src/app/resume/page.tsx',
  'client/src/app/profile/page.tsx',
  'client/src/app/projects/page.tsx',
  'client/src/app/jobs/page.tsx',
  'client/src/app/interview/page.tsx',
  'client/src/app/dashboard/page.tsx',
  'client/src/app/github/page.tsx',
  'client/src/app/analytics/page.tsx'
];

files.forEach(file => {
  const filepath = path.join('c:/Users/leela/OneDrive/Desktop/DEVFORGE AI', file);
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf8');
    let changed = false;
    
    if (!content.includes('useCallback')) {
      const importRegex = /import\s+(?:React\s*,\s*)?\{([^}]+)\}\s+from\s+['"]react['"];/;
      if (importRegex.test(content)) {
          content = content.replace(importRegex, (match, p1) => {
            return match.replace(p1, p1.trim() + ', useCallback');
          });
          changed = true;
      }
    }
    
    if (!content.includes('handleMobileMenuClick = useCallback')) {
      const returnRegex = /\s*return\s*\(\s*/;
      if (returnRegex.test(content)) {
          content = content.replace(returnRegex, (match) => {
              return `\n  const handleMobileMenuClick = useCallback(() => setMobileOpen(true), []);\n${match}`;
          });
          changed = true;
      }
    }
    
    if (content.includes('onMobileMenuClick={() => setMobileOpen(true)}')) {
        content = content.replace(/<Header onMobileMenuClick=\{\(\) => setMobileOpen\(true\)\}/g, '<Header onMobileMenuClick={handleMobileMenuClick}');
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(filepath, content);
        console.log('Updated ' + file);
    }
  }
});
