import { AreaComp, Comp, GameObj, PosComp } from "kaplay";
import { k } from "../kaplayCtx";

export interface DragComp extends Comp {
  isDragging: boolean;
}

type DragObj = GameObj<PosComp & AreaComp & DragComp>;

export function drag(): DragComp {
  let offset = k.vec2(0, 0);

  return {
    id: "drag",
    require: ["pos", "area"],
    isDragging: false,
    add(this: DragObj) {
      this.onHoverUpdate(() => {
        if (k.isMousePressed() && !this.isDragging) {
          this.isDragging = true;
          offset = k.mousePos().sub(this.pos);
        }
      });

      this.onUpdate(() => {
        if (this.isDragging) {
          this.pos = k.mousePos().sub(offset);
        }
      });

      k.onMouseRelease(() => {
        this.isDragging = false;
      });
    },
  };
}
