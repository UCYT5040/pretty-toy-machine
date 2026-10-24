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

export function physics(initialVel = k.vec2(0, 0), mass = 1): PhysicsComp {
  return {
    id: "physics",
    require: ["pos"],
    vel: initialVel,
    mass: mass,
    isStatic: false,
    restitution: 0.8,
    add(this: PhysicsObj) {
      this.onUpdate(() => {
        if ("isDragging" in this && (this as PhysicsObjWithDrag).isDragging) {
          this.vel = k.vec2(0, 0);
          return;
        }

        if (this.isStatic) return;

        const dt = k.dt();

        const planets = k.query({ include: "planet" });

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
