const RAD_ = Math.PI / 180;
class Spark {
  constructor() {
    this.x = getRand(canvas.width * 0.1, canvas.width * 0.83);
    this.y = -10;
    this.length = getRand(6, 15);
    this.rotate_deg0 = getRand(-40, 40);
    let temp = get_dx_dy(this.length, this.rotate_deg0, this.x, this.y);
    this.x1 = () => {
      return this.x + temp.dx
    };
    this.y1 = () => {
      return this.y + temp.dy
    };
    this.v_angle = getRand(-5, 5) / 10;
    this.vy = getRand(2, 4);
    this.vx = 1;
    this.lw = 0.7;
    this.temp = canvas.width * 0.5;
    this.temp1 = this.temp - this.x;
    this.flag_middle = true;
  }

  create() {
    context.beginPath();
    context.lineWidth = this.lw;
    context.save();
    context.moveTo(this.x, this.y);
    context.lineTo(this.x1(), this.y1());
    context.stroke();
    context.strokeStyle = 'blue';
    context.lineWidth = this.lw * 1.2;
    context.globalAlpha = 0.2;
    context.moveTo(this.x1() - 1.1, this.y1() - 1.1);
    context.lineTo(this.x - 1.1, this.y - 1.1);
    context.stroke();
    context.restore();
    context.closePath();
  }
}

class Sparks {

  constructor(count_of_sparks) {
    this.array = [];
    for (let i = 0; i < count_of_sparks; i++) {
      this.array.push(new Spark());
    }
  }

  movingDown() {
    this.array.forEach(el => {
      el.y += el.vy;
    });
  }

  movingAnglRand() {
    this.array.forEach(el => {
      el.y += el.vy;
      if (el.x <= canvas.width * 0.1 || el.x >= canvas.width * 0.83) {
        el.v_angle *= -1; // меняем направление движения
      }
      el.x += el.vx * el.v_angle;
    });
  }

  render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    this.array.forEach(el => {
      if (el.y > canvas.height * 0.5) {
        if (el.flag_middle) {
          el.temp = canvas.width * 0.5;
          el.temp1 = el.temp - el.x;
          el.v_angle = el.v_angle >= 0 ? el.v_angle : el.v_angle *= -1;
          el.vx = el.temp1 / (canvas.height * 0.5 / el.vy);
          el.flag_middle = false;
        }
        if (el.lw >= 0.01) {
          el.lw -= 0.006;
        } else {
          el.y = -10;
          el.x = getRand(canvas.width * 0.1, canvas.width * 0.83);
          el.lw = 0.7;
          el.vx = 1;
          el.flag_middle = true;
        }
      }
      el.create();
    });
    this.movingAnglRand();
  }

  start() {
    setInterval(() => {
      this.render();
      if (this.array.length < MAX_SPARKS) {
        let n_rand = getRand(0, 1);
        for (let i = 0; i < n_rand; i++) {
          this.array.push(new Spark());
        }
      }
    }, 50);
  }
}

function get_dx_dy(length, anlge, x, y) {
  let dx = Math.abs(Math.sin(inRad(anlge))) * length;
  let dy = Math.cos(inRad(anlge)) * length;
  if (anlge < 0) {
    dx *= -1;
  }
  return {
    dx: dx,
    dy: dy
  };
}

function getColor() {
  return colors_spark[getRand(0, colors_spark.length - 1)];
}

function getRand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function inRad(num) {
  return num * RAD_;
}

Array.prototype.lastEl = function () {
  return this[this.length - 1];
}

class ObjectCircleModel {
  /**
   * Объект 
   * @param {HTMLElement} mainHTMLcircle 
   */
  constructor(mainHTMLcircle) {
    this.tree = new Crl([], undefined, mainHTMLcircle); // иннициализируем корневой псевдо-круг
    this.main = mainHTMLcircle;
    this.str_tag = ["h2", "h3", "h4", "h5", "h6"];
    let allitems = this.main.querySelectorAll(this.str_tag.join(","));
    this.parseToObj(allitems); // создаём объект всех кругов, заполняя свойство tree
    this.setPositions();
    this.addEventForButtonPulsation();
    this.addEventsForAllCircles();
  }
  /**
   * @param {HTMLCollection} array 
   */
  parseToObj(array) {
    /* TN - Tag Name */
    let previos_TN;
    let curent_TN;
    this.tree.children.push(new Crl([], this.tree, array[0]));
    let curent;
    let previos = this.tree.children[0];
    for (let i = 0; i < array.length - 1; i++) {
      curent_TN = array[i + 1].tagName;
      previos_TN = array[i].tagName;
      curent = new Crl([], "", array[i + 1]);
      if (curent_TN > previos_TN) {
        curent.parent = previos;
        previos.children.push(curent);
        previos = previos.children.lastEl();
      } else if (curent_TN == previos_TN) {
        curent.parent = previos.parent;
        curent.parent.children.push(curent);
        previos = curent.parent.children.lastEl();
      } else { // (curent_TN < previos_TN) 
        curent.parent = previos.parent.parent;
        previos.parent.parent.children.push(curent);
        previos = previos.parent.parent.children.lastEl();
      }
    }
  }
  /**
   * Проходит по всем элементам свойства-массива childrens объекта obj и применяет к ним функцию func
   * @param {Crl} obj Объект
   * @param {Function} func  функция, которая будет производится над всеми элементами массива childrens объекта obj
   */
  traversal(obj, func) {
    let numOfChildren = obj.children.length;
    for (let i = 0; i < numOfChildren; i++) {
      let child = obj.children[i];
      func(child);
      this.traversal(child, func);
    }
  }
  addEventForButtonPulsation() {
    let btn = document.querySelector("#btn_start");
    let st = () => {
      if (typeof bg_anim != "undefined") {
        bg_anim.start();
      }
      this.main.classList.remove("small");
      btn.removeEventListener("click", st);
      setTimeout(() => {
        this.main.removeChild(btn);
      }, 2800);
      setTimeout(() => {
        btn.classList.add("lessening");
        this.initalAction();
      }, 1000);
    }
    btn.addEventListener("click", st);
  }
  initalAction() {
    let i = 0;
    let delayBeforeMoving = Math.round(800 / this.tree.children.length); // in seconds
    let temp = setInterval(() => {
      this.tree.children[i].htmlObj.classList.add("show");
      this.tree.children[i++].move("forward");
      if (i == this.tree.children.length)
        clearInterval(temp);
    }, delayBeforeMoving);
  }
  setPositions() {
    this.traversal(this.tree, this.tree.setPosition);
    this.traversal(this.tree, (circle) => {
      circle.move("backward")
    });
  }
  addEventsForAllCircles() {
    this.traversal(this.tree, this.tree.addListener)
  }
  updateSizes() {
    this.traversal(this.tree, this.tree.setPosition);
  }
}

class Crl {
  /**
   * @param {Array<Crl>} children
   * @param {Crl} parent 
   * @param {HTMLElement} htmlObj 
   */
  constructor(children, parent, htmlObj) {
    this.htmlObj = htmlObj;
    this.children = children;
    this.parent = parent;
    this.brothers;
    this.text = htmlObj.innerHTML;
    /**@type {Crl_position}*/
    this.position;
    this.animate = new Crl_Animate(this);
  }
  /** Возвращает массив одноуровневых Crl-элементов */
  getBrothers() {
    return this.parent.children.filter(el => {
      return el != this;
    });
  }
  /**
   * @param {Crl} circle 
   */
  setPosition(circle) {
    circle.position = new Crl_position(circle);
  }
  move(direction) {
    if (direction == "forward") {
      this.position.moveState = "forward";
      this.htmlObj.style.left = Math.round(this.position.x1 / (this.position.radiusMainCrl * 2) * 10000) / 100 + "%";
      this.htmlObj.style.top = Math.round(this.position.y1 / (this.position.radiusMainCrl * 2) * 10000) / 100 + "%";
    } else if (direction == "backward") {
      this.position.moveState = "backward";
      this.htmlObj.style.left = Math.round(this.position.x / (this.position.radiusMainCrl * 2) * 10000) / 100 + "%";
      this.htmlObj.style.top = Math.round(this.position.y / (this.position.radiusMainCrl * 2) * 10000) / 100 + "%";
    } else {
      console.error("direction = " + direction + ". Неверное направление/");
    }
  }
  moveToggle() {
    if (this.position.moveState == "forward") {
      this.move("backward");
    } else if (this.position.moveState == "backward") {
      this.move("forward");
    }
  }
  /** @param {Crl} circle */
  addListener(circle) {
    circle.htmlObj.addEventListener("click", () => {
      if (circle.children.length) {
        // circle.animate.toggle();
        circle.htmlObj.classList.toggle("active");
        circle.parent.htmlObj.classList.toggle("show");
        circle.getBrothers().forEach(el => {
          el.htmlObj.classList.toggle("show");
        });
        circle.children.forEach(el => {
          el.htmlObj.classList.toggle("show");
          el.moveToggle();
        });
      } else {
        // circle.putTextInCenter();
        /* создание анимации движения текста в центр круга из той кнопки, которая была нажата */
        let text = document.createElement("span");
        text.innerHTML = "sadasdasdasdas das das dd as das das dsa das dasd asd ";
        text.classList.add("text-in-middle");
        circle.htmlObj.parentNode.insertBefore(text, circle.htmlObj.nextSibling);
        text.style.left = circle.position.x1 + circle.htmlObj.offsetHeight/2 + "px";
        text.style.top = circle.position.y1 + circle.htmlObj.offsetHeight/2 + "px";    
        setTimeout(function() {
          text.classList.add("grow");
        text.style.left = circle.position.radiusMainCrl + "px";
        text.style.top = circle.position.radiusMainCrl + "px";

        }, 20);
      }
    });
  }

}

class Crl_position {
  /**
   * Содержит в себе координаты начальных и конечных позиций элементов, а так же угол относительно большого круга
   * @param {Crl} circle 
   */
  constructor(circle) {
    this.radiusMainCrl = document.getElementById("main_circle").offsetWidth / 2;
    this.calcPosition(circle);
    this.moveState = "backward";
  }
  /**
   * @param {Crl} circle 
   */
  calcPosition(circle) {
    // устанавливаем позицию самых "старших" кругов
    if (circle.parent.parent == undefined) {
      this.calcFirstBornChildren(circle);
    } //устанавливаем позицию оставшихся кругов
    else {
      this.calcRemainingChildren(circle);
    }
  }
  /**
   * @param {Crl} circle 
   */
  calcFirstBornChildren(circle) {
    let r = Math.round(circle.htmlObj.offsetWidth / 2);
    let R = this.radiusMainCrl;
    this.x = R - r;
    this.y = R - r;
    let angleChange = 360 / circle.parent.children.length;
    let index = circle.parent.children.indexOf(circle);
    this.angle = angleChange * index;
    let temp = this.posXY(this.angle, R, r);
    this.x1 = temp.x;
    this.y1 = temp.y;
  }
  /**
   * @param {Crl} circle 
   */
  calcRemainingChildren(circle) {
    let r = Math.round(circle.htmlObj.offsetWidth / 2);
    let R = this.radiusMainCrl;
    this.x = circle.parent.position.x1;
    this.y = circle.parent.position.y1;
    let angleChange = 360 / (circle.parent.children.length + 1);
    let index = circle.parent.children.indexOf(circle);
    let ang = circle.parent.position.angle + angleChange * ++index;
    this.angle = ang >= 360 ? ang - 360 : ang;
    let temp = this.posXY(this.angle, R, r);
    this.x1 = temp.x;
    this.y1 = temp.y;
  }
  circlePosXY(anlge, R) {
    return {
      'x': Math.cos(inRad(anlge)) * R,
      'y': Math.sin(inRad(anlge)) * R
    }
  }
  posXY(anlge, R, r) {
    let temp = this.circlePosXY(anlge, R);
    let xR = temp.x,
      yR = temp.y;
    let x_lt = Math.round(R + xR - r);
    let y_lt = Math.round(R - yR - r);
    return {
      'x': x_lt,
      'y': y_lt
    };
  }
}

class Crl_Animate {
  /**
   * Отвечает за добавление классов элементам при нажатии на них
   * @param {Crl} circle 
   */
  constructor(circle) {
    this.circle = circle;
    this.isShowChildren = false;
  }
  toggle() {
    this.isShowChildren ? this.expand() : this.collapse();
  }
  expand() {
    //hideSingleLvlEl();

    //showChildren();
  }
  collapse() {
    //hideChildren();
    //showSingleLvlEl();
  }
  /**
   * Скрыть элементы массива array
   * @param {Array<Crl>} array 
   */
  hide(array) {
    array.forEach(el => {
      el.htmlObj.classList.toggle("show");
    });
  }
  /**
   * Отобразить элементы массива array
   * @param {Array<Crl>} array 
   */
  show(array) {
    array.forEach(el => {
      el.htmlObj.classList.toggle("show");
    });
  }
}

var isMobile = {
  Android: function () {
    return navigator.userAgent.match(/Android/i) ? true : false;
  },
  BlackBerry: function () {
    return navigator.userAgent.match(/BlackBerry/i) ? true : false;
  },
  iOS: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
  },
  Windows: function () {
    return navigator.userAgent.match(/IEMobile/i) ? true : false;
  },
  any: function () {
    return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
  }
};

let canvas = document.querySelector("canvas");
let context = canvas.getContext("2d");
let bg_anim = undefined;
const MAX_SPARKS = 200;
if (!isMobile.any()) {
  canvas.setAttribute("width", canvas.parentElement.offsetWidth);
  canvas.setAttribute("height", canvas.parentElement.offsetHeight);
  context.strokeStyle = '#fff';
  bg_anim = new Sparks(1);
}

document.body.onload = function () {
  let main_c = document.querySelector("#main_circle");
  let app = new ObjectCircleModel(main_c);
  console.log(app);
  // window.addEventListener("resize", function() {
  //   app.updateSizes();
  // });
  // document.body.addEventListener("click", function() {
  //   console.log(app);
  // })
}



// function putTextInCenter() {
//   main.clearCenter();
//   forwardText();
// }