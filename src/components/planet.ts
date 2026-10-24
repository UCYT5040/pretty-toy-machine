import { AreaComp, Comp, GameObj, PosComp } from "kaplay";
import { k } from "../kaplayCtx";
import { PhysicsComp } from "./physics";

export interface PlanetComp extends Comp {
  isActive: boolean;
  radius: number;
}

type PlanetObj = GameObj<PosComp & AreaComp & PhysicsComp & PlanetComp>;

export function planet(): PlanetComp {
  return {
    id: "planet",
    require: ["pos", "area", "physics"],
    isActive: true,
    radius: 400,
    add(this: PlanetObj) {
      this.isStatic = this.isActive;

      this.onDraw(() => {
        if (this.isActive) {
          k.drawCircle({
            radius: this.radius,
            fill: false,
            outline: {
              width: 1,
              color: k.rgb(255, 255, 255),
            },
          });
        }
      });
    },
  };
}
