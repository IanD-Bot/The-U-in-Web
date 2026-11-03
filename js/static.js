/* Sections 4-9 are filled in by the next update (tasks 5-8). */
(function () {
  'use strict';
  ['trackers-items', 'permissions-items', 'cant-see-items', 'checklist-items', 'privacy-items', 'similar-items'].forEach(function (id) {
    var n = document.getElementById(id);
    if (n && !n.children.length) n.appendChild(window.UIW.el('p', { class: 'intro', text: 'Coming soon.' }));
  });
  document.documentElement.classList.add('ready');
})();
