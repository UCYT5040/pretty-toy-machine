import { AreaComp, CircleComp, Comp, GameObj, PosComp, Vec2 } from "kaplay";
import { k } from "../kaplayCtx";
import { DragComp } from "./drag";

export interface PhysicsComp extends Comp {
  vel: Vec2;
  mass: number;
  isStatic: boolean;
  restitution: number;
}

type PhysicsObjComps = PosComp & AreaComp & PhysicsComp;
type PhysicsObj = GameObj<PhysicsObjComps>;
type PhysicsObjWithDrag = GameObj<PhysicsObjComps & DragComp>;

const G = 1000000;
const FLICK_TIME_WINDOW = 0.08;
const MIN_FLICK_SPEED = 200;
const FLICK_SCALE = 0.75;
const MAX_FLICK_SPEED = 2200;

export function physics(initialVel = k.vec2(0, 0), mass = 1): PhysicsComp {
  let wasDragging = false;
  let dragHistory: { pos: Vec2; time: number }[] = [];

  return {
    id: "physics",
    require: ["pos"],
    vel: initialVel,
    mass: mass,
    isStatic: false,
    restitution: 0.8,
    add(this: PhysicsObj) {
      this.onUpdate(() => {
        const isDragging =
          "isDragging" in this && (this as PhysicsObjWithDrag).isDragging;

        if (isDragging) {
          const now = k.time();
          dragHistory.push({ pos: this.pos.clone(), time: now });
          while (
            dragHistory.length > 2 &&
            now - dragHistory[0].time > FLICK_TIME_WINDOW
          ) {
            dragHistory.shift();
          }
          wasDragging = true;
          this.vel = k.vec2(0, 0);
          return;
        }

        if (wasDragging) {
          wasDragging = false;
          if (dragHistory.length >= 2) {
            const first = dragHistory[0];
            const last = dragHistory[dragHistory.length - 1];
            const dtDrag = last.time - first.time;
            if (dtDrag > 0) {
              const rawVel = last.pos.sub(first.pos).scale(1 / dtDrag);
              if (rawVel.len() >= MIN_FLICK_SPEED) {
                const scaledVel = rawVel.scale(FLICK_SCALE);
                this.vel =
                  scaledVel.len() > MAX_FLICK_SPEED
                    ? scaledVel.unit().scale(MAX_FLICK_SPEED)
                    : scaledVel;
              }
            }
          }
          dragHistory = [];
        }

        if (this.isStatic) return;

        const dt = k.dt();

        const planets = k.query({ include: "planet" }); // consider using k.get ?

        let useRegularGravity = true;
        let acceleration = k.vec2(0, 0);

        for (const planet of planets) {
          if (!planet.isActive) continue;

          const distance = planet.pos.dist(this.pos);
          const direction = planet.pos.sub(this.pos).unit();

          const pullMagnitude = G / Math.max(distance * distance, 100);

          if (distance < planet.radius) {
            useRegularGravity = false;
            acceleration = acceleration.add(direction.scale(pullMagnitude));
          }
        }

        if (useRegularGravity) {
          acceleration = k.getGravityDirection().scale(k.getGravity());
        }

        this.vel = this.vel.add(acceleration.scale(dt));
        this.pos = this.pos.add(this.vel.scale(dt));
      });

      this.onCollideUpdate("solid", (solid, col) => {
        if (!col || col.displacement.isZero() || this.isStatic)
          return { paused: false, cancel: () => {} };

        const normal = col.displacement.unit();

        this.pos = this.pos.add(col.displacement);
        const normalVelocity = this.vel.dot(normal);

        if (normalVelocity < 0) {
          const impulse = normal.scale((1 + this.restitution) * normalVelocity);
          this.vel = this.vel.sub(impulse);
        }

        if (this.vel.len() < 30) {
          this.vel = k.vec2(0, 0);
        }

        return {
          paused: false,
          cancel: () => {},
        };
      });
    },
  };
}
