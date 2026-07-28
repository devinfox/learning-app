/* Opens the generated SVG in Illustrator, promotes each top-level group to its
   own named layer, and saves a native .ai. Run via:
     osascript -e 'tell application "Adobe Illustrator" to do javascript file "..."' */

#target illustrator

function run() {
  var dir = '/Users/devin/Desktop/Projects/Folders/Archive/desktop-april/screenshot/DESKTOP 2026/projects/uv-brain/design-exports/hair/';

  app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

  var src = new File(dir + 'hair.svg');
  if (!src.exists) return 'ERROR: missing ' + src.fsName;

  var doc = app.open(src);
  var report = [];

  /* Promote top-level groups to layers so the Layers panel is usable. */
  var base = doc.layers[0];
  var tops = [];
  for (var i = 0; i < base.pageItems.length; i++) {
    var it = base.pageItems[i];
    if (it.parent === base && it.typename === 'GroupItem') tops.push(it);
  }

  for (var j = tops.length - 1; j >= 0; j--) {
    var g = tops[j];
    var nm = (g.name && g.name.length) ? g.name : ('Group ' + (j + 1));
    var L = doc.layers.add();
    L.name = nm;
    g.move(L, ElementPlacement.PLACEATBEGINNING);
    report.push(nm);
  }

  if (base.pageItems.length === 0) base.remove();

  /* Leave the artboard as imported: it already matches the SVG viewBox.
     Fitting to visibleBounds would include the glow's overspill. */

  var opts = new IllustratorSaveOptions();
  opts.pdfCompatible = true;

  var out = new File(dir + 'hair.ai');
  doc.saveAs(out, opts);

  var summary = 'OK layers=' + doc.layers.length + ' :: ' + report.join(' | ');
  doc.close(SaveOptions.DONOTSAVECHANGES);
  return summary;
}

run();
