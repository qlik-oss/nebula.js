import {
  useElement,
  useLayout,
  useStaleLayout,
  useTheme,
  usePromise,
  useModel,
  useEffect,
  useState,
  useInteractionState,
  useSelections,
} from "@nebula.js/stardust";

import properties from "./object-properties";
import data from "./data";
import ext from "./ext";
import { createRoot } from "react-dom/client";

import Table from "./components/Table";
import "./components/chart.css";

async function buildChartData(staleLayout, model) {
  if (!staleLayout?.qHyperCube?.qDataPages?.[0]?.qMatrix?.length) {
    return { rows: [], meta: { status: "empty" } };
  }

  // TODO: replace with chart-specific async work, for example:
  // - secondary model calls
  // - derived calculations
  // - formatting pipelines
  // Keep this in usePromise so nebula can await rendering
  // Using model.getInfo() here is just and example of async work, and is not actually needed
  const info = await model.getInfo();

  return {
    rows: staleLayout.qHyperCube.qDataPages[0].qMatrix,
    meta: { status: "ready", objectId: info.qId },
  };
}

export default function supernova(galaxy) {
  return {
    qae: {
      properties,
      data,
    },
    ext: ext(galaxy),
    component() {
      const element = useElement();
      const layout = useLayout();
      const staleLayout = useStaleLayout();
      const theme = useTheme();
      const model = useModel();
      const interactions = useInteractionState();
      const selections = useSelections();

      const [renderer, setRenderer] = useState();
      const [dataset, datasetError] = usePromise(
        () => buildChartData(staleLayout, model),
        [staleLayout, model],
      );

      useEffect(() => {
        const r = createRoot(element);
        setRenderer(r);
        return () => r.unmount();
      }, [element]);

      useEffect(() => {
        renderer &&
          renderer.render(
            <Table
              layout={layout}
              staleLayout={staleLayout}
              dataset={dataset}
              datasetError={datasetError}
              theme={theme}
              interactions={interactions}
              selections={selections}
            />,
          );
      }, [
        renderer,
        layout,
        staleLayout,
        dataset,
        datasetError,
        theme,
        interactions,
        selections,
      ]);
    },
  };
}
