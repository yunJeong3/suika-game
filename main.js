import { Bodies, Body, Engine, Events, Render, Runner, World } from "matter-js";
import { FRUITS } from "./fruits";

const elemtentArea = document.getElementById('game-box');

const engine = Engine.create();
const render = Render.create({
  engine,
  element: elemtentArea,
  options: {
    wireframes: false,
    background: "white",
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
});

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

// body, fruit를 나중에 다시 사용하기 위해 전역번수 선언한다.
let currentBody = null;
let currentFruit = null;
// 액션을 막는 전역변수 선언
let disableAction = false;
// 움직일 때 자연스러운 무빙
let interval = null;
// 승리 조건인 suika의 개수를 세는 변수
let suika_num = 0;

function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    // 과일이 바로 안떨어지게 설정.
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

// *** world를 초기화하는 함수 ***
function resetWorld() {
  console.log('실행됨');
}

// 키보드를 감지하기 위한 javascript 함수, 만약 키가 눌리면 event 실행
// s: 과일 떨어트리기  a: 좌측이동  d: 우측이동
window.onkeydown = (event) => {
  // disableAction이 true면 switch문이 실행되지 않게 선언
  if(disableAction) {
    return;
  }
  // 키를 구분하기 위한 swith case
  switch (event.code) {
    case "KeyA":
      if(interval) return;
      interval = setInterval(() => {
        if(currentBody.position.x - currentFruit.radius > 32)
          // currentBody(현재 선택된 과일)의 x좌표에서 왼쪽으로 이동해야 하기 때문에 -1
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 1,
            y: currentBody.position.y
          });
      }, 5);
      // 벽 영역을 침범하지 않게 이동을 제한하는 조건문
      break;

    case "KeyD":
      if(interval) return;
      interval = setInterval(() => {
        // 벽 영역을 침범하지 않게 이동을 제한하는 조건문
        if(currentBody.position.x - currentFruit.radius < 550)
          // currentBody의 x좌표에서 우측 +1 이동
          Body.setPosition(currentBody, {
            x: currentBody.position.x + 1,
            y: currentBody.position.y
          });
      }, 5);
      break;

    case "KeyS":
      // currentBody의 isSleeping을 false로 설정하여 하단으로 떨어지게 설정
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);
      break;
  }
}

// 이동 키(A, D)를 뗏을 때
window.onkeyup = (event) => {
  switch (event.code) {
    case "KeyA" :
    case "KeyD" :
      // 반복해서 실행되는 것을 없애줌
      clearInterval(interval);
      interval = null;
  }
}


Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    // index 설정으로 과일 확인, 부딛힌 두 개의 과일이 같다면 없애고, 
    if(collision.bodyA.index === collision.bodyB.index) {
      // 새로운 과일을 생성하기 위해 현재 과일을 index에 저장
      const index = collision.bodyA.index;

      // 수박일 때에는 합쳐지면 안되기 때문에 return
      if(index === FRUITS.length-1) {
        return;
      }
      World.remove(world, [collision.bodyA, collision.bodyB]);

      // 합쳐져서 생긴 새로운 과일을 index의 +1로 생성
      const newFruit = FRUITS[index + 1];

      // 합쳐진 위치의 x좌표와 y좌표 지정
      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: {
            sprite :{texture: `${newFruit.name}.png`}
          },
          index: index+1,
        }
      );

      World.add(world, newBody);

      // 맵 초기화 기능 테스트
      if(newBody.index === 4) {
        // resetWorld();
      }

      // 수박일 때에는 최종 점수 +1
      if(newBody.index === FRUITS.length-1) {
        suika_num++;
        console.log(suika_num);
      }
      // 수박이 2개일 때 초기화
      if(suika_num === 2) {
        alert("수박 두개로 승리~");
      }
    }

    // topLine에 collision이 겹쳐진다면 gameover 표시
    if (
      !disableAction &&
      (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")) {
      alert("Game over");
      World.clear;
    }
    
  });
});

addFruit();