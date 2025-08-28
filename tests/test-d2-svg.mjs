import fs from "node:fs/promises";
import { getD2Svg } from "../utils/kroki-utils.mjs";

const d2RawContent = `vars: {
  d2-config: {
    layout-engine: elk
    theme-id: 0
    theme-overrides: {
      N1: "#232A32"
      N2: "#73808C"
      N4: "#FFFFFF"
      N5: "#FAFBFC"
      N7: "#ffffff"

      B1: "#8EDDD9"
      B2: "#C9DCE6"
      B3: "#EEF9F9"
      B4: "#F7F8FA"
      B5: "#FCFDFD"
      B6: "#E3E9F0"

      AA2: "#9EB7C5"
      AA4: "#E3EBF2"
      AA5: "#F6FAFC"

      AB4: "#B8F1F6"
      AB5: "#E3F8FA"
    }
    dark-theme-id: 200
    dark-theme-overrides: {
      N1: "#FFFFFF"
      N2: "#AEBBC8"
      N4: "#232A32"
      N5: "#1A2129"
      N7: "#0F1216"

      B1: "#07363A"
      B2: "#102531"
      B3: "#0A1A22"
      B4: "#0E141A"
      B5: "#121619"
      B6: "#1C232A"

      AA2: "#4A6270"
      AA4: "#1E2A33"
      AA5: "#0F181D"

      AB4: "#106269"
      AB5: "#0A2E32"
    }
  }
}
network: {
  cell tower: {
    satellites: {
      shape: stored_data
      style.multiple: true
    }

    transmitter

    satellites -> transmitter: send
    satellites -> transmitter: send
    satellites -> transmitter: send
  }

  online portal: {
    ui: {shape: hexagon}
  }

  data processor: {
    storage: {
      shape: cylinder
      style.multiple: true
    }
  }

  cell tower.transmitter -> data processor.storage: phone logs
}

user: {
  shape: person
  width: 130
}

user -> network.cell tower: make call
user -> network.online portal.ui: access {
  style.stroke-dash: 3
}

api server -> network.online portal.ui: display
api server -> logs: persist
logs: {shape: page; style.multiple: true}

network.data processor -> api server
`;

async function main() {
  const svgContent = await getD2Svg({ content: d2RawContent });
  await fs.writeFile("output.svg", svgContent);
}

main();
