/**
 * The modules that the page of nebula serve has and a visualization imports by name, instead of bundling them: the
 * visualization and the page share one of each, as a host does for the visualizations that it loads.
 * The visualization bundles all other modules, as the build of it for serve leaves out the externals that are not here.
 */
export default ['@nebula.js/stardust', 'react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'];
