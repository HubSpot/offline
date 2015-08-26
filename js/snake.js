(function() {
  var canvas, dot, fill, hide, keyHandler, move, randDot, render, score, show, snake, speed, stop;

  canvas = dot = score = speed = stop = snake = randDot = fill = null;

  render = function() {
    canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    canvas.setAttribute('style', 'width: 100%; height: 100%; margin: -8px; position: absolute; top: 0; left: 0; z-index: 1000');
    canvas.setAttribute('viewBox', '0 0 1000 1000');
    document.body.appendChild(canvas);
    dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', 20);
    (randDot = function() {
      dot.setAttribute('cx', (Math.random() * 960) | 0 + 20);
      return dot.setAttribute('cy', (Math.random() * 960) | 0 + 20);
    })();
    canvas.appendChild(dot);
    snake = {
      direction: 0,
      nodes: []
    };
    score = 0;
    speed = 10;
    stop = false;
    return move();
  };

  move = function() {
    var dotX, dotY, lastNode, lastX, lastY, nX, nY, node, old;
    if (stop) {
      return;
    }
    lastNode = snake.nodes[snake.nodes.length - 1];
    if (lastNode) {
      lastX = +lastNode.getAttribute('cx');
      lastY = +lastNode.getAttribute('cy');
    } else {
      lastX = 500;
      lastY = 500;
    }
    if (snake.nodes.length > score) {
      old = snake.nodes.shift();
      canvas.removeChild(old);
    }
    nX = lastX + Math.cos(snake.direction) * speed;
    nY = lastY + Math.sin(snake.direction) * speed;
    node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    node.setAttribute('r', 20);
    node.setAttribute('cx', nX);
    node.setAttribute('cy', nY);
    if (fill) {
      node.style.fill = fill;
    }
    dotX = +dot.getAttribute('cx');
    dotY = +dot.getAttribute('cy');
    if ((dotX - 20 < nX && nX < dotX + 20) && (dotY - 20 < nY && nY < dotY + 20)) {
      score++;
      speed++;
      randDot();
    }
    canvas.appendChild(node);
    snake.nodes.push(node);
    return requestAnimationFrame(move);
  };

  keyHandler = function(e) {
    var ref;
    if ((37 <= (ref = e.keyCode) && ref <= 40)) {
      snake.direction = Math.PI / 2 * ((e.keyCode - 35) % 4);
      return false;
    }
  };

  show = function() {
    document.addEventListener('keydown', keyHandler);
    return render();
  };

  hide = function() {
    document.removeEventListener('keydown', keyHandler);
    stop = true;
    return document.removeChild(canvas);
  };

  setTimeout(function() {
    if (Offline.getOption('game') && (document.addEventListener != null)) {
      Offline.on('down', show);
      Offline.on('up', hide);
      return Offline.on('reconnect:failure', function() {
        fill = '#ec8787';
        return setTimeout(function() {
          return fill = 'black';
        }, 2000);
      });
    }
  }, 0);

}).call(this);
