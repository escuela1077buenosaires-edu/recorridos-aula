(function () {
  'use strict';

  var assignments = [];
  var tree = document.getElementById('courseTree');
  var status = document.getElementById('status');
  var storageKey = 'aie1077CursoSeleccionado';

  function text(tag, value, className) {
    var node = document.createElement(tag);
    node.textContent = value;
    if (className) node.className = className;
    return node;
  }

  function valuesFor(turn, grade, division) {
    return assignments.filter(function (item) {
      return item.turno === turn && String(item.grado) === String(grade) && item.division === division;
    }).sort(function (a, b) { return Number(a.orden) - Number(b.orden); });
  }

  function activityList(items) {
    if (!items.length) return text('div', 'Todavia no hay actividades habilitadas para esta division.', 'empty');
    var list = document.createElement('div');
    list.className = 'activities';
    items.forEach(function (item, index) {
      var card = document.createElement('a');
      card.className = 'activity';
      card.href = item.url;
      card.target = '_blank';
      card.rel = 'noopener';
      card.appendChild(text('span', String(index + 1), 'number'));
      var body = document.createElement('span');
      body.className = 'activity-text';
      body.appendChild(text('strong', item.titulo));
      body.appendChild(text('span', item.area || 'Actividad educativa'));
      card.appendChild(body);
      card.appendChild(text('span', 'Abrir actividad', 'open-label'));
      list.appendChild(card);
    });
    return list;
  }

  function remember(value) {
    try { window.localStorage.setItem(storageKey, value); } catch (err) {}
  }

  function remembered() {
    try { return window.localStorage.getItem(storageKey) || ''; } catch (err) { return ''; }
  }

  function render() {
    var selected = remembered();
    tree.textContent = '';
    ['manana', 'tarde'].forEach(function (turn) {
      var turnNode = document.createElement('details');
      turnNode.className = 'turn ' + turn;
      turnNode.open = selected.indexOf(turn + '|') === 0;
      turnNode.appendChild(text('summary', turn === 'manana' ? 'Turno ma\u00f1ana' : 'Turno tarde'));
      var turnBody = document.createElement('div');
      turnBody.className = 'turn-body';
      for (var grade = 1; grade <= 7; grade++) {
        var gradeNode = document.createElement('details');
        gradeNode.className = 'grade';
        gradeNode.open = selected.indexOf(turn + '|' + grade + '|') === 0;
        gradeNode.appendChild(text('summary', grade + '.\u00ba grado'));
        var gradeBody = document.createElement('div');
        gradeBody.className = 'grade-body';
        ['A', 'B', 'C'].forEach(function (division) {
          var key = turn + '|' + grade + '|' + division;
          var items = valuesFor(turn, grade, division);
          var divisionNode = document.createElement('details');
          divisionNode.className = 'division';
          divisionNode.open = selected === key;
          divisionNode.appendChild(text('summary', 'Divisi\u00f3n ' + division + ' (' + items.length + ')'));
          var content = document.createElement('div');
          content.className = 'division-content';
          content.appendChild(activityList(items));
          divisionNode.appendChild(content);
          divisionNode.addEventListener('toggle', function () {
            if (this.open) remember(this.getAttribute('data-key'));
          });
          divisionNode.setAttribute('data-key', key);
          gradeBody.appendChild(divisionNode);
        });
        gradeNode.appendChild(gradeBody);
        turnBody.appendChild(gradeNode);
      }
      turnNode.appendChild(turnBody);
      tree.appendChild(turnNode);
    });
    status.hidden = true;
  }

  document.getElementById('clearMemory').addEventListener('click', function () {
    try { window.localStorage.removeItem(storageKey); } catch (err) {}
    render();
  });

  fetch('catalogo.json?t=' + Date.now(), { cache: 'no-store' }).then(function (response) {
    if (!response.ok) throw new Error('No se pudo cargar el listado de actividades.');
    return response.json();
  }).then(function (data) {
    assignments = Array.isArray(data.asignaciones) ? data.asignaciones : [];
    render();
  }).catch(function (err) {
    status.textContent = err.message;
    status.className = 'status error';
  });
}());
