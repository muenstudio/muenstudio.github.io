const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
const sharp = require('sharp');

async function build() {
  const root = path.resolve(__dirname, '..');
  const projects = path.join(root, 'projects');
  const context = vm.createContext({ window: {} });
  vm.runInContext(await fs.readFile(path.join(projects, 'projects-registry.js'), 'utf8'), context);
  const manifest = {};

  for (const slug of context.window.portfolioProjectsRegistry) {
    const folder = path.join(projects, slug);
    vm.runInContext(await fs.readFile(path.join(folder, 'project-data.js'), 'utf8'), context);
    const project = context.window.portfolioProjects[slug];
    const cover = project.coverImage || project.images[0];
    const output = path.join(folder, 'previews');
    await fs.mkdir(output, { recursive: true });
    await sharp(path.join(folder, cover)).resize(720, 405, { fit: 'cover' })
      .webp({ quality: 77 }).toFile(path.join(output, 'cover-thumb.webp'));

    const sizes = {};
    for (const name of new Set(project.images)) {
      const image = sharp(path.join(folder, name));
      const { width, height } = await image.metadata();
      sizes[name] = [width, height];
      if (width > 960) {
        await image.resize({ width: 960 }).webp({ quality: 80 }).toFile(path.join(output, name));
      }
    }
    manifest[slug] = { cover, sizes };
  }

  await fs.writeFile(path.join(projects, 'preview-sizes.js'),
    'window.projectPreviews = ' + JSON.stringify(manifest, null, 2) + ';\n');
  const media = path.join(root, 'services/media');
  for (const name of ['assembly', 'heritage', 'revit', 'scan']) {
    await sharp(path.join(media, name + '.webp')).resize({ width: 720 })
      .webp({ quality: 80 }).toFile(path.join(media, name + '-mobile.webp'));
  }
}

build().catch(error => { console.error(error); process.exitCode = 1; });
