import { Bodies, Body, Engine, Render, Runner, World } from "matter-js";
import { FRUITS } from "./fruits";

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#F7F4C8",
    width: 620,
    height: 850,
  }
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  name: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#E6B143" }
})

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

// body, fruit를 나중에 다시 사용하기 위해 전역번수 선언한다.
let currentBody = null;
let currentFruit = null;

function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    // 준비중, 과일이 바로 안떨어진다.
    isSleeping: true,
    render: {
      sprite: { texture: `/${fruit.name}.png` }
    },
    // 탄성, 튀기는 정도 0.0~1.0
    restitution: 0.2,
  });

  // 전역변수에 값 저장
  currentBody = body;
  currentFruit = fruit;
  
  World.add(world, body);
}

// 키보드를 감지하기 위한 javascript 함수, 만약 키가 눌리면 event 실행
// w: ↑  s: ↓  a: ←  d: →
window.onkeydown = (event) => {
  // 키를 구분하기 위한 swith case
  switch (event.code) {
    case "KeyA":
      // currentBody(현재 선택된 과일)의 x좌표에서 왼쪽으로 이동해야 하기 때문에 -10
      Body.setPosition(currentBody, {
        x: currentBody.position.x - 10,
        y: currentBody.position.y
      });
      break;

    case "KeyD":
      // currentBody의 x좌표에서 우측 +10 이동
      Body.setPosition(currentBody, {
        x: currentBody.position.x + 10,
        y: currentBody.position.y
      });
      break;

    case "keyS":
      // currentBody의 isSleeping을 false로 설정하여 하단으로 떨어지게 설정
  }
}

addFruit();