// Course data names its icons with the old Bootstrap Icons names ("bi-fire").
// This maps them to lucide-react so the data files don't have to change.
import { createElement } from "react";
import {
  ArrowLeftRight,
  Calculator,
  Coffee,
  Droplets,
  Flame,
  FlaskConical,
  GraduationCap,
  Radio,
  Ruler,
  Snowflake,
  Thermometer,
  Wind,
  Zap,
} from "lucide-react";

const ICONS = {
  "bi-thermometer-half": Thermometer,
  "bi-balloon": Wind,
  "bi-calculator": Calculator,
  "bi-snow": Snowflake,
  "bi-rulers": Ruler,
  "bi-lightning-charge": Zap,
  "bi-fire": Flame,
  "bi-cup-hot": Coffee,
  "bi-broadcast": Radio,
  "bi-beaker": FlaskConical,
  "bi-arrow-left-right": ArrowLeftRight,
  "bi-mortarboard": GraduationCap,
  "bi-droplet-half": Droplets,
};

/** lucide component for a data icon name; a flask for anything unmapped. */
export function iconFor(name) {
  return ICONS[name] || FlaskConical;
}

/** Renders the lucide icon for a data icon name: <DataIcon name="bi-fire" />. */
export function DataIcon({ name, ...props }) {
  return createElement(iconFor(name), props);
}
