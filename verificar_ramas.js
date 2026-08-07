// Avisa si hay arreglos en ramas que NO están en main ANTES de compilar el EXE.
//
// POR QUÉ EXISTE (6-ago-2026): las revisiones semanales dejaban sus arreglos en
// una rama con un PR en borrador y nadie los mergeaba. Aca quedaron afuera las
// del 16-jul, 23-jul y 1-ago. El sitio se despliega solo desde main, asi que
// todo lo que no este en main simplemente no existe para los clientes.
//
// Correr:  node verificar_ramas.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const sh = (cmd) => execSync(cmd, { cwd: RAIZ, encoding: 'utf8' }).trim();

// Ramas ya revisadas que NO aportan código (su contenido llegó a main por otro
// camino y solo traerían documentación duplicada). Una por línea; # es comentario.
function descartadas() {
  const f = path.join(RAIZ, 'ramas_descartadas.txt');
  if (!fs.existsSync(f)) return new Set();
  return new Set(fs.readFileSync(f, 'utf8').split(/\r?\n/)
    .map(l => l.split('#')[0].trim()).filter(Boolean));
}

try {
  try { sh('git fetch origin --quiet --prune'); } catch (_) {
    console.log('  (no se pudo consultar GitHub — se revisa con lo que hay local)');
  }

  const ignorar = descartadas();
  // `HEAD:` y no `HEAD^{tree}`: en Windows esto corre a través de cmd.exe, que
  // trata el `^` como carácter de escape y lo borra ("HEAD{tree}" → error).
  const arbolActual = sh('git rev-parse HEAD:');

  const ramas = sh('git branch -r --no-merged HEAD')
    .split('\n').map(s => s.trim()).filter(Boolean)
    .filter(b => !b.includes('HEAD') && !ignorar.has(b));

  const pendientes = [];
  for (const b of ramas) {
    // ¿Mergearla cambiaría algo de verdad? Si el árbol resultante es idéntico al
    // actual, la rama no aporta nada aunque git la marque como "no mergeada"
    // (pasa cuando el contenido se aplicó por otro commit).
    let arbol;
    try { arbol = sh(`git merge-tree --write-tree HEAD ${b}`).split('\n')[0]; }
    catch (_) { arbol = null; } // conflicto: seguro aporta algo
    if (arbol === arbolActual) continue;

    const fecha  = sh(`git log -1 --format=%ad --date=short ${b}`);
    const titulo = sh(`git log -1 --format=%s ${b}`);
    // Solo interesa si toca CÓDIGO. Una rama que solo agrega documentación no
    // justifica frenar un despliegue.
    let tocaCodigo = true;
    if (arbol) {
      const archivos = sh(`git diff --name-only ${arbolActual} ${arbol}`).split('\n').filter(Boolean);
      tocaCodigo = archivos.some(a => /\.(html|js)$/i.test(a));
    }
    pendientes.push({ b, fecha, titulo, tocaCodigo });
  }

  const conCodigo = pendientes.filter(p => p.tocaCodigo);
  if (!conCodigo.length) {
    console.log('  Todo lo revisado esta en main.');
    process.exit(0);
  }

  console.log('');
  console.log('  ================================================================');
  console.log('   HAY ARREGLOS QUE NO ESTAN EN MAIN');
  console.log('  ================================================================');
  console.log('');
  console.log('   Estos arreglos NO estan en produccion:');
  console.log('');
  for (const p of conCodigo) console.log(`     ${p.fecha}  ${p.b}\n                 ${p.titulo}`);
  console.log('');
  console.log('   Que hacer: pedile a Claude Code que las revise y las junte.');
  console.log('   Si ya las revisaste y no aportan nada, agregalas a');
  console.log('   ramas_descartadas.txt y volve a correr esto.');
  console.log('');
  process.exit(1);
} catch (e) {
  console.log('  No se pudo verificar las ramas: ' + e.message);
  console.log('  Se continua igual (no se frena el despliegue por esto).');
  process.exit(0);
}
